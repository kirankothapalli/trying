const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const User = require('../models/User');
const { Cart, Order, Wishlist, Payment, Coupon, Category } = require('../models/index');
const { sendSuccess, sendError, getPaginationData, calculateBilling, sanitizeUser } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../utils/emailUtils');

// ── CART ─────────────────────────────────────────────────────────────────────
const getCart = asyncHandler(async(req,res)=>{
  const cart=await Cart.findOne({user:req.user._id}).populate({path:'items.product',select:'name images price discountedPrice discountPercent stock slug brand isActive',populate:{path:'category',select:'name'}});
  if(!cart) return sendSuccess(res,200,'Cart is empty',{items:[],billing:calculateBilling([])});
  const billing=calculateBilling(cart.items,cart.couponDiscount);
  return sendSuccess(res,200,'Cart fetched',{...cart.toObject(),billing});
});

const addToCart = asyncHandler(async(req,res)=>{
  const {productId,quantity=1}=req.body;
  const product=await Product.findById(productId);
  if(!product||!product.isActive) return sendError(res,404,'Product not found');
  if(product.stock<quantity) return sendError(res,400,`Only ${product.stock} units available`);
  let cart=await Cart.findOne({user:req.user._id});
  if(!cart) cart=await Cart.create({user:req.user._id,items:[]});
  const existing=cart.items.find(i=>i.product.toString()===productId);
  const price=product.discountedPrice||product.price;
  if(existing){ const nq=existing.quantity+parseInt(quantity); if(nq>product.stock) return sendError(res,400,`Only ${product.stock} units available`); existing.quantity=nq; existing.price=price; }
  else { cart.items.push({product:productId,quantity:parseInt(quantity),price}); }
  await cart.save();
  return sendSuccess(res,200,'Item added to cart');
});

const updateCartItem = asyncHandler(async(req,res)=>{
  const {quantity}=req.body;
  const cart=await Cart.findOne({user:req.user._id});
  if(!cart) return sendError(res,404,'Cart not found');
  const item=cart.items.id(req.params.itemId);
  if(!item) return sendError(res,404,'Item not found in cart');
  const product=await Product.findById(item.product);
  if(product&&product.stock<quantity) return sendError(res,400,`Only ${product.stock} units available`);
  if(parseInt(quantity)<=0) item.deleteOne(); else item.quantity=parseInt(quantity);
  await cart.save();
  return sendSuccess(res,200,'Cart updated');
});

const removeFromCart = asyncHandler(async(req,res)=>{
  const cart=await Cart.findOne({user:req.user._id});
  if(!cart) return sendError(res,404,'Cart not found');
  cart.items=cart.items.filter(i=>i._id.toString()!==req.params.itemId);
  await cart.save();
  return sendSuccess(res,200,'Item removed');
});

const clearCart = asyncHandler(async(req,res)=>{
  await Cart.findOneAndUpdate({user:req.user._id},{items:[],couponCode:'',couponDiscount:0});
  return sendSuccess(res,200,'Cart cleared');
});

// ── WISHLIST ──────────────────────────────────────────────────────────────────
const getWishlist = asyncHandler(async(req,res)=>{
  const w=await Wishlist.findOne({user:req.user._id}).populate({path:'products',select:'name images price discountedPrice discountPercent rating numReviews stock slug brand',populate:{path:'category',select:'name'}});
  return sendSuccess(res,200,'Wishlist fetched',w?.products||[]);
});

const toggleWishlist = asyncHandler(async(req,res)=>{
  const {productId}=req.body;
  const product=await Product.findById(productId);
  if(!product) return sendError(res,404,'Product not found');
  let w=await Wishlist.findOne({user:req.user._id});
  if(!w) w=await Wishlist.create({user:req.user._id,products:[]});
  const idx=w.products.map(String).indexOf(String(productId));
  let message;
  if(idx>-1){ w.products.splice(idx,1); message='Removed from wishlist'; }
  else { w.products.push(productId); message='Added to wishlist'; }
  await w.save();
  return sendSuccess(res,200,message,{inWishlist:idx===-1});
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
const createOrder = asyncHandler(async(req,res)=>{
  const {shippingAddress,paymentMethod,couponCode,notes}=req.body;
  const cart=await Cart.findOne({user:req.user._id}).populate('items.product');
  if(!cart||cart.items.length===0) return sendError(res,400,'Cart is empty');
  for(const item of cart.items){
    if(!item.product||!item.product.isActive) return sendError(res,400,'A product is no longer available');
    if(item.product.stock<item.quantity) return sendError(res,400,`Insufficient stock for ${item.product.name}`);
  }
  let discount=0; let appliedCoupon=null;
  if(couponCode){
    const coupon=await Coupon.findOne({code:couponCode.toUpperCase()});
    if(coupon){ const subtotal=cart.items.reduce((s,i)=>s+i.price*i.quantity,0); const v=coupon.isValid(subtotal,req.user._id); if(v.valid){ discount=coupon.calculateDiscount(subtotal); appliedCoupon=coupon; } }
  }
  const billing=calculateBilling(cart.items,discount);
  const orderItems=cart.items.map(i=>({ product:i.product._id, name:i.product.name, image:i.product.images[0]?.url||'', price:i.price, quantity:i.quantity, sku:i.product.sku }));
  const order=await Order.create({ user:req.user._id, items:orderItems, shippingAddress, billing, couponCode:couponCode||'', paymentMethod, notes, statusHistory:[{status:'pending',note:'Order placed'}] });
  for(const item of cart.items) await Product.findByIdAndUpdate(item.product._id,{$inc:{stock:-item.quantity,soldCount:item.quantity}});
  if(appliedCoupon){ appliedCoupon.usedCount+=1; appliedCoupon.usedBy.push(req.user._id); await appliedCoupon.save(); }
  await Cart.findOneAndUpdate({user:req.user._id},{items:[],couponCode:'',couponDiscount:0});
  try { const tpl=emailTemplates.orderConfirmation(req.user.name,order); await sendEmail({to:req.user.email,...tpl}); } catch(e){}
  return sendSuccess(res,201,'Order created',order);
});

const getUserOrders = asyncHandler(async(req,res)=>{
  const {page=1,limit=10}=req.query; const skip=(parseInt(page)-1)*parseInt(limit);
  const [orders,total]=await Promise.all([Order.find({user:req.user._id}).sort({createdAt:-1}).skip(skip).limit(parseInt(limit)).lean(), Order.countDocuments({user:req.user._id})]);
  return sendSuccess(res,200,'Orders fetched',orders,getPaginationData(page,limit,total));
});

const getOrderById = asyncHandler(async(req,res)=>{
  const order=await Order.findById(req.params.id).populate('user','name email');
  if(!order) return sendError(res,404,'Order not found');
  if(order.user._id.toString()!==req.user._id.toString()&&req.user.role!=='admin') return sendError(res,403,'Access denied');
  return sendSuccess(res,200,'Order fetched',order);
});

const cancelOrder = asyncHandler(async(req,res)=>{
  const order=await Order.findById(req.params.id);
  if(!order) return sendError(res,404,'Order not found');
  if(order.user.toString()!==req.user._id.toString()) return sendError(res,403,'Access denied');
  if(!['pending','confirmed'].includes(order.orderStatus)) return sendError(res,400,'Order cannot be cancelled at this stage');
  order.orderStatus='cancelled'; order.cancelReason=req.body.reason||'Cancelled by user';
  order.statusHistory.push({status:'cancelled',note:req.body.reason||'Cancelled by user'});
  for(const item of order.items) await Product.findByIdAndUpdate(item.product,{$inc:{stock:item.quantity,soldCount:-item.quantity}});
  await order.save();
  return sendSuccess(res,200,'Order cancelled');
});

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
const createStripePaymentIntent = asyncHandler(async(req,res)=>{
  let stripe; try { stripe=require('stripe')(process.env.STRIPE_SECRET_KEY); } catch(e){ return sendError(res,500,'Stripe not configured'); }
  const order=await Order.findById(req.body.orderId);
  if(!order) return sendError(res,404,'Order not found');
  if(order.user.toString()!==req.user._id.toString()) return sendError(res,403,'Access denied');
  const pi=await stripe.paymentIntents.create({ amount:Math.round(order.billing.total*100), currency:'inr', metadata:{orderId:req.body.orderId,userId:req.user._id.toString()} });
  await Payment.create({user:req.user._id,order:req.body.orderId,amount:order.billing.total,currency:'INR',method:'stripe',transactionId:pi.id});
  return sendSuccess(res,200,'Payment intent created',{clientSecret:pi.client_secret});
});

const confirmStripePayment = asyncHandler(async(req,res)=>{
  const {orderId,paymentIntentId}=req.body;
  const order=await Order.findById(orderId);
  if(!order) return sendError(res,404,'Order not found');
  order.paymentStatus='paid'; order.orderStatus='confirmed';
  order.paymentDetails={transactionId:paymentIntentId,paidAt:new Date()};
  order.statusHistory.push({status:'confirmed',note:'Payment confirmed via Stripe'});
  await order.save();
  await Payment.findOneAndUpdate({transactionId:paymentIntentId},{status:'success'});
  return sendSuccess(res,200,'Payment confirmed',order);
});

const createRazorpayOrder = asyncHandler(async(req,res)=>{
  let Razorpay; try { Razorpay=require('razorpay'); } catch(e){ return sendError(res,500,'Razorpay not configured'); }
  const order=await Order.findById(req.body.orderId);
  if(!order) return sendError(res,404,'Order not found');
  const rp=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
  const rpOrder=await rp.orders.create({amount:Math.round(order.billing.total*100),currency:'INR',receipt:order.orderNumber});
  await Payment.create({user:req.user._id,order:req.body.orderId,amount:order.billing.total,currency:'INR',method:'razorpay',gatewayOrderId:rpOrder.id});
  return sendSuccess(res,200,'Razorpay order created',{orderId:rpOrder.id,amount:rpOrder.amount,currency:rpOrder.currency,keyId:process.env.RAZORPAY_KEY_ID});
});

const verifyRazorpayPayment = asyncHandler(async(req,res)=>{
  const crypto=require('crypto');
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderId}=req.body;
  const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if(expected!==razorpay_signature) return sendError(res,400,'Invalid payment signature');
  const order=await Order.findById(orderId);
  if(!order) return sendError(res,404,'Order not found');
  order.paymentStatus='paid'; order.orderStatus='confirmed';
  order.paymentDetails={paymentId:razorpay_payment_id,orderId:razorpay_order_id,signature:razorpay_signature,paidAt:new Date()};
  order.statusHistory.push({status:'confirmed',note:'Payment verified via Razorpay'});
  await order.save();
  await Payment.findOneAndUpdate({gatewayOrderId:razorpay_order_id},{status:'success',gatewayPaymentId:razorpay_payment_id,gatewaySignature:razorpay_signature});
  return sendSuccess(res,200,'Payment verified',order);
});

// ── USER PROFILE ──────────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async(req,res)=>{
  const allowed=['name','phone','avatar'];
  const updates={}; allowed.forEach(f=>{ if(req.body[f]!==undefined) updates[f]=req.body[f]; });
  const user=await User.findByIdAndUpdate(req.user._id,updates,{new:true,runValidators:true});
  return sendSuccess(res,200,'Profile updated',sanitizeUser(user));
});

const changePassword = asyncHandler(async(req,res)=>{
  const {currentPassword,newPassword}=req.body;
  const user=await User.findById(req.user._id).select('+password');
  if(!await user.comparePassword(currentPassword)) return sendError(res,400,'Current password incorrect');
  user.password=newPassword; await user.save();
  return sendSuccess(res,200,'Password changed');
});

const addAddress = asyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id);
  if(req.body.isDefault) user.addresses.forEach(a=>{ a.isDefault=false; });
  user.addresses.push(req.body); await user.save();
  return sendSuccess(res,200,'Address added',sanitizeUser(user));
});

const deleteAddress = asyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id);
  user.addresses=user.addresses.filter(a=>a._id.toString()!==req.params.addressId);
  await user.save();
  return sendSuccess(res,200,'Address deleted',sanitizeUser(user));
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────
const getDashboardStats = asyncHandler(async(req,res)=>{
  const now=new Date(); const som=new Date(now.getFullYear(),now.getMonth(),1); const slm=new Date(now.getFullYear(),now.getMonth()-1,1);
  const [tr,mr,lmr,to,mo,tu,nu,tp,ls,ro,top,obs]=await Promise.all([
    Order.aggregate([{$match:{paymentStatus:'paid'}},{$group:{_id:null,total:{$sum:'$billing.total'}}}]),
    Order.aggregate([{$match:{paymentStatus:'paid',createdAt:{$gte:som}}},{$group:{_id:null,total:{$sum:'$billing.total'}}}]),
    Order.aggregate([{$match:{paymentStatus:'paid',createdAt:{$gte:slm,$lt:som}}},{$group:{_id:null,total:{$sum:'$billing.total'}}}]),
    Order.countDocuments(), Order.countDocuments({createdAt:{$gte:som}}),
    User.countDocuments({role:'user'}), User.countDocuments({role:'user',createdAt:{$gte:som}}),
    Product.countDocuments({isActive:true}), Product.countDocuments({isActive:true,stock:{$lt:10}}),
    Order.find().sort({createdAt:-1}).limit(10).populate('user','name email').lean(),
    Product.find({isActive:true}).sort({soldCount:-1}).limit(5).select('name soldCount price images').lean(),
    Order.aggregate([{$group:{_id:'$orderStatus',count:{$sum:1}}}]),
  ]);
  const revenueChart=[];
  for(let i=5;i>=0;i--){
    const s=new Date(now.getFullYear(),now.getMonth()-i,1); const e=new Date(now.getFullYear(),now.getMonth()-i+1,1);
    const d=await Order.aggregate([{$match:{paymentStatus:'paid',createdAt:{$gte:s,$lt:e}}},{$group:{_id:null,revenue:{$sum:'$billing.total'},orders:{$sum:1}}}]);
    revenueChart.push({month:s.toLocaleString('default',{month:'short'}),revenue:d[0]?.revenue||0,orders:d[0]?.orders||0});
  }
  const lmRev=lmr[0]?.total||0; const mRev=mr[0]?.total||0;
  const stats={ revenue:{total:tr[0]?.total||0,monthly:mRev,lastMonth:lmRev,growth:lmRev?((mRev-lmRev)/lmRev*100).toFixed(1):0}, orders:{total:to,monthly:mo,byStatus:obs}, users:{total:tu,newThisMonth:nu}, products:{total:tp,lowStock:ls}, recentOrders:ro, topProducts:top, revenueChart };
  return sendSuccess(res,200,'Dashboard stats fetched',stats);
});

const getAllUsers = asyncHandler(async(req,res)=>{
  const {page=1,limit=20,search,role}=req.query; const filter={};
  if(search) filter.$or=[{name:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}}];
  if(role) filter.role=role;
  const skip=(parseInt(page)-1)*parseInt(limit);
  const [users,total]=await Promise.all([User.find(filter).sort({createdAt:-1}).skip(skip).limit(parseInt(limit)).lean(), User.countDocuments(filter)]);
  return sendSuccess(res,200,'Users fetched',users,getPaginationData(page,limit,total));
});

const updateUserRole = asyncHandler(async(req,res)=>{
  if(req.params.id===req.user._id.toString()) return sendError(res,400,"Cannot change your own role");
  const user=await User.findByIdAndUpdate(req.params.id,{role:req.body.role},{new:true});
  if(!user) return sendError(res,404,'User not found');
  return sendSuccess(res,200,'User role updated',sanitizeUser(user));
});

const toggleUserStatus = asyncHandler(async(req,res)=>{
  if(req.params.id===req.user._id.toString()) return sendError(res,400,"Cannot deactivate yourself");
  const user=await User.findById(req.params.id);
  if(!user) return sendError(res,404,'User not found');
  user.isActive=!user.isActive; await user.save();
  return sendSuccess(res,200,`User ${user.isActive?'activated':'deactivated'}`);
});

const getAllOrders = asyncHandler(async(req,res)=>{
  const {page=1,limit=20,status,paymentStatus}=req.query; const filter={};
  if(status) filter.orderStatus=status; if(paymentStatus) filter.paymentStatus=paymentStatus;
  const skip=(parseInt(page)-1)*parseInt(limit);
  const [orders,total]=await Promise.all([Order.find(filter).sort({createdAt:-1}).skip(skip).limit(parseInt(limit)).populate('user','name email').lean(), Order.countDocuments(filter)]);
  return sendSuccess(res,200,'Orders fetched',orders,getPaginationData(page,limit,total));
});

const updateOrderStatus = asyncHandler(async(req,res)=>{
  const {status,note,trackingNumber}=req.body;
  const order=await Order.findById(req.params.id);
  if(!order) return sendError(res,404,'Order not found');
  order.orderStatus=status; order.statusHistory.push({status,note:note||`Status updated to ${status}`});
  if(trackingNumber) order.trackingNumber=trackingNumber;
  if(status==='delivered') order.deliveredAt=new Date();
  await order.save();
  return sendSuccess(res,200,'Order status updated',order);
});

// ── CATEGORIES ────────────────────────────────────────────────────────────────
const getCategories = asyncHandler(async(req,res)=>{ const cats=await Category.find({isActive:true}).sort({name:1}).lean(); return sendSuccess(res,200,'Categories fetched',cats); });
const createCategory = asyncHandler(async(req,res)=>{ const cat=await Category.create(req.body); return sendSuccess(res,201,'Category created',cat); });
const updateCategory = asyncHandler(async(req,res)=>{ const cat=await Category.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!cat) return sendError(res,404,'Not found'); return sendSuccess(res,200,'Category updated',cat); });
const deleteCategory = asyncHandler(async(req,res)=>{ const cat=await Category.findById(req.params.id); if(!cat) return sendError(res,404,'Not found'); cat.isActive=false; await cat.save(); return sendSuccess(res,200,'Category deleted'); });

// ── COUPONS ───────────────────────────────────────────────────────────────────
const applyCoupon = asyncHandler(async(req,res)=>{
  const {code}=req.body; const cart=await Cart.findOne({user:req.user._id});
  if(!cart||cart.items.length===0) return sendError(res,400,'Cart is empty');
  const coupon=await Coupon.findOne({code:code.toUpperCase()});
  if(!coupon) return sendError(res,404,'Invalid coupon code');
  const subtotal=cart.items.reduce((s,i)=>s+i.price*i.quantity,0);
  const v=coupon.isValid(subtotal,req.user._id); if(!v.valid) return sendError(res,400,v.message);
  const discount=coupon.calculateDiscount(subtotal);
  cart.couponCode=code.toUpperCase(); cart.couponDiscount=discount; await cart.save();
  return sendSuccess(res,200,'Coupon applied',{discount,code:code.toUpperCase()});
});

const removeCoupon = asyncHandler(async(req,res)=>{ await Cart.findOneAndUpdate({user:req.user._id},{couponCode:'',couponDiscount:0}); return sendSuccess(res,200,'Coupon removed'); });
const getCoupons = asyncHandler(async(req,res)=>{ const coupons=await Coupon.find().sort({createdAt:-1}).lean(); return sendSuccess(res,200,'Coupons fetched',coupons); });
const createCoupon = asyncHandler(async(req,res)=>{ const coupon=await Coupon.create(req.body); return sendSuccess(res,201,'Coupon created',coupon); });
const updateCoupon = asyncHandler(async(req,res)=>{ const coupon=await Coupon.findByIdAndUpdate(req.params.id,req.body,{new:true}); if(!coupon) return sendError(res,404,'Not found'); return sendSuccess(res,200,'Coupon updated',coupon); });
const deleteCoupon = asyncHandler(async(req,res)=>{ await Coupon.findByIdAndDelete(req.params.id); return sendSuccess(res,200,'Coupon deleted'); });

module.exports = { getCart,addToCart,updateCartItem,removeFromCart,clearCart, getWishlist,toggleWishlist, createOrder,getUserOrders,getOrderById,cancelOrder, createStripePaymentIntent,confirmStripePayment,createRazorpayOrder,verifyRazorpayPayment, updateProfile,changePassword,addAddress,deleteAddress, getDashboardStats,getAllUsers,updateUserRole,toggleUserStatus,getAllOrders,updateOrderStatus, getCategories,createCategory,updateCategory,deleteCategory, applyCoupon,removeCoupon,getCoupons,createCoupon,updateCoupon,deleteCoupon };
