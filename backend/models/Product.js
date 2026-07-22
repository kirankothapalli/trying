const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, name:{type:String,required:true}, rating:{type:Number,required:true,min:1,max:5}, comment:{type:String,required:true,maxlength:500} }, {timestamps:true});
const productSchema = new mongoose.Schema({
  name: { type:String, required:[true,'Product name required'], trim:true, maxlength:100 },
  slug: { type:String, unique:true, lowercase:true },
  description: { type:String, required:[true,'Description required'], maxlength:2000 },
  shortDescription: { type:String, maxlength:200 },
  price: { type:Number, required:[true,'Price required'], min:0 },
  discountPercent: { type:Number, default:0, min:0, max:100 },
  discountedPrice: { type:Number, default:0 },
  category: { type:mongoose.Schema.Types.ObjectId, ref:'Category', required:[true,'Category required'] },
  brand: { type:String, required:[true,'Brand required'], trim:true },
  images: [{ url:{type:String,required:true}, alt:{type:String,default:''}, isPrimary:{type:Boolean,default:false} }],
  stock: { type:Number, required:[true,'Stock required'], min:0, default:0 },
  sku: { type:String, unique:true, trim:true },
  tags: [{ type:String, trim:true }],
  specifications: [{ key:String, value:String }],
  reviews: [reviewSchema],
  numReviews: { type:Number, default:0 },
  rating: { type:Number, default:0 },
  isFeatured: { type:Boolean, default:false },
  isActive: { type:Boolean, default:true },
  weight: { type:Number, default:0 },
  soldCount: { type:Number, default:0 },
}, { timestamps:true, toJSON:{virtuals:true}, toObject:{virtuals:true} });
productSchema.index({ name:'text', description:'text', brand:'text', tags:'text' });
productSchema.index({ category:1 }); productSchema.index({ price:1 }); productSchema.index({ rating:-1 }); productSchema.index({ createdAt:-1 }); productSchema.index({ slug:1 }); productSchema.index({ isActive:1 });
productSchema.virtual('inStock').get(function(){ return this.stock>0; });
productSchema.pre('save', function(next){
  if(this.isModified('name')) this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'-'+Date.now();
  if(this.isModified('price')||this.isModified('discountPercent')) this.discountedPrice = this.discountPercent>0 ? Math.round(this.price*(1-this.discountPercent/100)) : this.price;
  next();
});
productSchema.methods.updateRating = function(){
  if(this.reviews.length===0){ this.rating=0; this.numReviews=0; }
  else { const total=this.reviews.reduce((s,r)=>s+r.rating,0); this.rating=Math.round((total/this.reviews.length)*10)/10; this.numReviews=this.reviews.length; }
};
module.exports = mongoose.model('Product', productSchema);
