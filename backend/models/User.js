const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type:String, required:[true,'Name required'], trim:true, minlength:2, maxlength:50 },
  email: { type:String, required:[true,'Email required'], unique:true, lowercase:true, trim:true, match:[/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,'Invalid email'] },
  password: { type:String, required:[true,'Password required'], minlength:8, select:false },
  role: { type:String, enum:['user','admin'], default:'user' },
  avatar: { type:String, default:'' },
  phone: { type:String, default:'' },
  addresses: [{
    label:{ type:String, default:'Home' }, street:{ type:String, required:true },
    city:{ type:String, required:true }, state:{ type:String, required:true },
    zipCode:{ type:String, required:true }, country:{ type:String, required:true, default:'India' },
    isDefault:{ type:Boolean, default:false }
  }],
  isActive: { type:Boolean, default:true },
  isEmailVerified: { type:Boolean, default:false },
  emailVerificationToken: String, emailVerificationExpire: Date,
  resetPasswordToken: String, resetPasswordExpire: Date,
  refreshToken: { type:String, select:false },
  lastLogin: Date,
  loginAttempts: { type:Number, default:0 },
  lockUntil: Date,
}, { timestamps:true, toJSON:{virtuals:true}, toObject:{virtuals:true} });

userSchema.index({ email:1 }); userSchema.index({ role:1 }); userSchema.index({ createdAt:-1 });
userSchema.virtual('isLocked').get(function(){ return !!(this.lockUntil && this.lockUntil > Date.now()); });
userSchema.pre('save', async function(next){ if(!this.isModified('password')) return next(); const salt = await bcrypt.genSalt(12); this.password = await bcrypt.hash(this.password,salt); next(); });
userSchema.methods.comparePassword = async function(p){ return bcrypt.compare(p, this.password); };
userSchema.methods.incrementLoginAttempts = async function(){
  if(this.lockUntil && this.lockUntil < Date.now()) return this.updateOne({ $unset:{lockUntil:1}, $set:{loginAttempts:1} });
  const updates = { $inc:{loginAttempts:1} };
  if(this.loginAttempts+1 >= 5 && !this.isLocked) updates.$set = { lockUntil: Date.now()+2*60*60*1000 };
  return this.updateOne(updates);
};
module.exports = mongoose.model('User', userSchema);
