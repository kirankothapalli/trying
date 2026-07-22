const mongoose = require('mongoose');

// Category
const categorySchema = new mongoose.Schema({
  name:{type:String,required:true,unique:true,trim:true},
  slug:{type:String,unique:true,lowercase:true},
  description:{type:String,default:''},
  image:{type:String,default:''},
  isActive:{type:Boolean,default:true},
  parent:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
},{timestamps:true});
categorySchema.pre('save',function(next){ if(this.isModified('name')) this.slug=this.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''); next(); });
const Category = mongoose.model('Category',categorySchema);

// Order
const orderItemSchema = new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true}, name:{type:String,required:true}, image:{type:String}, price:{type:Number,required:true}, quantity:{type:Number,required:true,min:1}, sku:{type:String} });
const orderSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  orderNumber:{type:String,unique:true},
  items:[orderItemSchema],
  shippingAddress:{ fullName:{type:String,required:true}, phone:{type:String,required:true}, street:{type:String,required:true}, city:{type:String,required:true}, state:{type:String,required:true}, zipCode:{type:String,required:true}, country:{type:String,required:true} },
  billing:{ subtotal:{type:Number,required:true}, tax:{type:Number,default:0}, shipping:{type:Number,default:0}, discount:{type:Number,default:0}, total:{type:Number,required:true} },
  couponCode:{type:String,default:''},
  paymentMethod:{type:String,enum:['stripe','razorpay','cod'],required:true},
  paymentStatus:{type:String,enum:['pending','paid','failed','refunded'],default:'pending'},
  paymentDetails:{ transactionId:String, paymentId:String, orderId:String, signature:String, paidAt:Date },
  orderStatus:{type:String,enum:['pending','confirmed','processing','shipped','delivered','cancelled','returned'],default:'pending'},
  statusHistory:[{ status:String, note:String, updatedAt:{type:Date,default:Date.now} }],
  trackingNumber:{type:String,default:''},
  estimatedDelivery:Date,
  deliveredAt:Date,
  cancelReason:{type:String,default:''},
  notes:{type:String,default:''},
},{timestamps:true});
orderSchema.index({user:1,createdAt:-1}); orderSchema.index({orderStatus:1}); orderSchema.index({paymentStatus:1});
orderSchema.pre('save',function(next){ if(!this.orderNumber) this.orderNumber='ORD-'+Date.now()+'-'+Math.random().toString(36).substr(2,5).toUpperCase(); next(); });
const Order = mongoose.model('Order',orderSchema);

// Cart
const cartItemSchema = new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true}, quantity:{type:Number,required:true,min:1,default:1}, price:{type:Number,required:true} });
const cartSchema = new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true}, items:[cartItemSchema], couponCode:{type:String,default:''}, couponDiscount:{type:Number,default:0} },{timestamps:true});
const Cart = mongoose.model('Cart',cartSchema);

// Wishlist
const wishlistSchema = new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true}, products:[{type:mongoose.Schema.Types.ObjectId,ref:'Product'}] },{timestamps:true});
const Wishlist = mongoose.model('Wishlist',wishlistSchema);

// Payment
const paymentSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'},
  amount:{type:Number,required:true}, currency:{type:String,default:'INR'},
  method:{type:String,enum:['stripe','razorpay','cod'],required:true},
  status:{type:String,enum:['created','success','failed','refunded'],default:'created'},
  transactionId:String, gatewayOrderId:String, gatewayPaymentId:String, gatewaySignature:String,
  metadata:{type:mongoose.Schema.Types.Mixed},
},{timestamps:true});
const Payment = mongoose.model('Payment',paymentSchema);

// Coupon
const couponSchema = new mongoose.Schema({
  code:{type:String,required:true,unique:true,uppercase:true,trim:true},
  description:{type:String,default:''},
  discountType:{type:String,enum:['percentage','fixed'],required:true},
  discountValue:{type:Number,required:true,min:0},
  minOrderAmount:{type:Number,default:0},
  maxDiscount:{type:Number,default:null},
  usageLimit:{type:Number,default:null},
  usedCount:{type:Number,default:0},
  isActive:{type:Boolean,default:true},
  expiresAt:{type:Date,required:true},
  usedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
},{timestamps:true});
couponSchema.methods.isValid = function(orderAmount,userId){
  if(!this.isActive) return {valid:false,message:'Coupon inactive'};
  if(this.expiresAt < new Date()) return {valid:false,message:'Coupon expired'};
  if(this.usageLimit && this.usedCount >= this.usageLimit) return {valid:false,message:'Usage limit reached'};
  if(orderAmount < this.minOrderAmount) return {valid:false,message:`Min order amount is ₹${this.minOrderAmount}`};
  if(userId && this.usedBy.map(String).includes(String(userId))) return {valid:false,message:'Already used this coupon'};
  return {valid:true};
};
couponSchema.methods.calculateDiscount = function(amount){
  if(this.discountType==='percentage'){ const d=(amount*this.discountValue)/100; return this.maxDiscount ? Math.min(d,this.maxDiscount) : d; }
  return Math.min(this.discountValue,amount);
};
const Coupon = mongoose.model('Coupon',couponSchema);

module.exports = { Category, Order, Cart, Wishlist, Payment, Coupon };
