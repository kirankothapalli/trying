const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateSecureToken, hashToken, setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/jwtUtils');
const { sendEmail, emailTemplates } = require('../utils/emailUtils');
const { sendSuccess, sendError, sanitizeUser } = require('../utils/helpers');

const register = asyncHandler(async(req,res)=>{
  let {name,email,password} = req.body;
  if(email) email = email.toLowerCase();
  if(await User.findOne({email})) return sendError(res,409,'An account with this email already exists');
  const verificationToken = generateSecureToken();
  const user = await User.create({ name, email, password, emailVerificationToken:hashToken(verificationToken), emailVerificationExpire:Date.now()+24*60*60*1000 });
  try { const tpl=emailTemplates.verification(name,verificationToken,process.env.CLIENT_URL); await sendEmail({to:email,...tpl}); } catch(e){}
  const accessToken = generateAccessToken(user._id,user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken=refreshToken; user.lastLogin=new Date(); await user.save({validateBeforeSave:false});
  setRefreshTokenCookie(res,refreshToken);
  return sendSuccess(res,201,'Registration successful',{user:sanitizeUser(user),accessToken});
});

const login = asyncHandler(async(req,res)=>{
  let {email,password} = req.body;
  if(email) email = email.toLowerCase();
  const user = await User.findOne({email}).select('+password +refreshToken +loginAttempts +lockUntil');
  if(!user) return sendError(res,401,'Invalid email or password');
  if(user.isLocked) return sendError(res,423,'Account locked. Try again in 2 hours.');
  if(!user.isActive) return sendError(res,401,'Account deactivated.');
  const isMatch = await user.comparePassword(password);
  if(!isMatch){ await user.incrementLoginAttempts(); return sendError(res,401,'Invalid email or password'); }
  user.loginAttempts=0; user.lockUntil=undefined; user.lastLogin=new Date();
  const accessToken=generateAccessToken(user._id,user.role);
  const refreshToken=generateRefreshToken(user._id);
  user.refreshToken=refreshToken; await user.save({validateBeforeSave:false});
  setRefreshTokenCookie(res,refreshToken);
  return sendSuccess(res,200,'Login successful',{user:sanitizeUser(user),accessToken});
});

const logout = asyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id).select('+refreshToken');
  if(user){ user.refreshToken=undefined; await user.save({validateBeforeSave:false}); }
  clearRefreshTokenCookie(res);
  return sendSuccess(res,200,'Logged out successfully');
});

const refreshToken = asyncHandler(async(req,res)=>{
  const token=req.cookies.refreshToken;
  if(!token) return sendError(res,401,'Refresh token not found');
  let decoded;
  try { decoded=verifyRefreshToken(token); } catch(e){ return sendError(res,401,'Invalid or expired refresh token'); }
  const user=await User.findById(decoded.id).select('+refreshToken');
  if(!user||user.refreshToken!==token) return sendError(res,401,'Invalid refresh token');
  const newAccess=generateAccessToken(user._id,user.role);
  const newRefresh=generateRefreshToken(user._id);
  user.refreshToken=newRefresh; await user.save({validateBeforeSave:false});
  setRefreshTokenCookie(res,newRefresh);
  return sendSuccess(res,200,'Token refreshed',{accessToken:newAccess});
});

const verifyEmail = asyncHandler(async(req,res)=>{
  const hashedToken=hashToken(req.params.token);
  const user=await User.findOne({emailVerificationToken:hashedToken,emailVerificationExpire:{$gt:Date.now()}});
  if(!user) return sendError(res,400,'Invalid or expired token');
  user.isEmailVerified=true; user.emailVerificationToken=undefined; user.emailVerificationExpire=undefined;
  await user.save({validateBeforeSave:false});
  return sendSuccess(res,200,'Email verified successfully');
});

const forgotPassword = asyncHandler(async(req,res)=>{
  let email = req.body.email;
  if(email) email = email.toLowerCase();
  const user=await User.findOne({email});
  if(!user) return sendSuccess(res,200,'If that email exists, a reset link has been sent');
  const resetToken=generateSecureToken();
  user.resetPasswordToken=hashToken(resetToken); user.resetPasswordExpire=Date.now()+60*60*1000;
  await user.save({validateBeforeSave:false});
  try { const tpl=emailTemplates.passwordReset(user.name,resetToken,process.env.CLIENT_URL); await sendEmail({to:user.email,...tpl}); }
  catch(e){ user.resetPasswordToken=undefined; user.resetPasswordExpire=undefined; await user.save({validateBeforeSave:false}); return sendError(res,500,'Failed to send email'); }
  return sendSuccess(res,200,'Password reset email sent');
});

const resetPassword = asyncHandler(async(req,res)=>{
  const hashedToken=hashToken(req.params.token);
  const user=await User.findOne({resetPasswordToken:hashedToken,resetPasswordExpire:{$gt:Date.now()}}).select('+password');
  if(!user) return sendError(res,400,'Invalid or expired reset token');
  user.password=req.body.password; user.resetPasswordToken=undefined; user.resetPasswordExpire=undefined;
  user.loginAttempts=0; user.lockUntil=undefined; await user.save();
  clearRefreshTokenCookie(res);
  return sendSuccess(res,200,'Password reset successful. Please log in.');
});

const getMe = asyncHandler(async(req,res)=>{
  return sendSuccess(res,200,'User fetched',sanitizeUser(req.user));
});

module.exports = { register, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe };
