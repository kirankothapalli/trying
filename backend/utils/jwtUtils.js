const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generateAccessToken = (userId, role) => jwt.sign({ id:userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE||'15m' });
const generateRefreshToken = (userId) => jwt.sign({ id:userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE||'7d' });
const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:process.env.NODE_ENV==='production'?'strict':'lax', maxAge:7*24*60*60*1000, path:'/' });
};
const clearRefreshTokenCookie = (res) => res.cookie('refreshToken','',{ httpOnly:true, expires:new Date(0), path:'/' });
module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, generateSecureToken, hashToken, setRefreshTokenCookie, clearRefreshTokenCookie };
