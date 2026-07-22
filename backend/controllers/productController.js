const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { Category } = require('../models/index');
const { sendSuccess, sendError, getPaginationData, buildProductFilter, buildProductSort } = require('../utils/helpers');

const getProducts = asyncHandler(async(req,res)=>{
  const {page=1,limit=12,sort} = req.query;
  const filter=buildProductFilter(req.query); const sortObj=buildProductSort(sort);
  const skip=(parseInt(page)-1)*parseInt(limit);
  const [products,total]=await Promise.all([Product.find(filter).populate('category','name slug').sort(sortObj).skip(skip).limit(parseInt(limit)).lean(), Product.countDocuments(filter)]);
  return sendSuccess(res,200,'Products fetched',products,getPaginationData(page,limit,total));
});

const getProduct = asyncHandler(async(req,res)=>{
  const {identifier}=req.params;
  const isObjectId=/^[0-9a-fA-F]{24}$/.test(identifier);
  const query=isObjectId?{_id:identifier}:{slug:identifier};
  const product=await Product.findOne({...query,isActive:true}).populate('category','name slug').populate('reviews.user','name avatar');
  if(!product) return sendError(res,404,'Product not found');
  return sendSuccess(res,200,'Product fetched',product);
});

const createProduct = asyncHandler(async(req,res)=>{
  const category=await Category.findById(req.body.category);
  if(!category) return sendError(res,400,'Category not found');
  if(!req.body.sku) req.body.sku='SKU-'+Date.now()+'-'+Math.random().toString(36).substr(2,4).toUpperCase();
  if(req.body.images&&req.body.images.length>0) req.body.images[0].isPrimary=true;
  const product=await Product.create(req.body);
  await product.populate('category','name slug');
  return sendSuccess(res,201,'Product created',product);
});

const updateProduct = asyncHandler(async(req,res)=>{
  const product=await Product.findById(req.params.id);
  if(!product) return sendError(res,404,'Product not found');
  if(req.body.category){ const cat=await Category.findById(req.body.category); if(!cat) return sendError(res,400,'Category not found'); }
  const updated=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate('category','name slug');
  return sendSuccess(res,200,'Product updated',updated);
});

const deleteProduct = asyncHandler(async(req,res)=>{
  const product=await Product.findById(req.params.id);
  if(!product) return sendError(res,404,'Product not found');
  product.isActive=false; await product.save();
  return sendSuccess(res,200,'Product deleted');
});

const addReview = asyncHandler(async(req,res)=>{
  const {rating,comment}=req.body;
  const product=await Product.findById(req.params.id);
  if(!product) return sendError(res,404,'Product not found');
  if(product.reviews.find(r=>r.user.toString()===req.user._id.toString())) return sendError(res,400,'Already reviewed this product');
  product.reviews.push({user:req.user._id,name:req.user.name,rating:parseInt(rating),comment});
  product.updateRating(); await product.save();
  return sendSuccess(res,201,'Review added');
});

const deleteReview = asyncHandler(async(req,res)=>{
  const product=await Product.findById(req.params.id);
  if(!product) return sendError(res,404,'Product not found');
  const review=product.reviews.id(req.params.reviewId);
  if(!review) return sendError(res,404,'Review not found');
  if(review.user.toString()!==req.user._id.toString()&&req.user.role!=='admin') return sendError(res,403,'Not authorized');
  review.deleteOne(); product.updateRating(); await product.save();
  return sendSuccess(res,200,'Review deleted');
});

const getFeaturedProducts = asyncHandler(async(req,res)=>{
  const products=await Product.find({isFeatured:true,isActive:true}).populate('category','name slug').sort({createdAt:-1}).limit(8).lean();
  return sendSuccess(res,200,'Featured products fetched',products);
});

const getRelatedProducts = asyncHandler(async(req,res)=>{
  const product=await Product.findById(req.params.id);
  if(!product) return sendError(res,404,'Product not found');
  const related=await Product.find({category:product.category,_id:{$ne:product._id},isActive:true}).limit(6).populate('category','name slug').lean();
  return sendSuccess(res,200,'Related products fetched',related);
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, deleteReview, getFeaturedProducts, getRelatedProducts };
