const sendSuccess = (res, statusCode=200, message='Success', data=null, meta=null) => {
  const response = { success:true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};
const sendError = (res, statusCode=500, message='Internal Server Error', errors=null) => {
  const response = { success:false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page)||1; const itemsPerPage = parseInt(limit)||12; const totalPages = Math.ceil(total/itemsPerPage);
  return { currentPage, itemsPerPage, totalPages, totalItems:total, hasNextPage:currentPage<totalPages, hasPrevPage:currentPage>1 };
};
const buildProductFilter = (query) => {
  const filter = { isActive:true };
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = { $regex:query.brand, $options:'i' };
  if (query.search) filter.$text = { $search:query.search };
  if (query.minPrice || query.maxPrice) { filter.price={}; if(query.minPrice) filter.price.$gte=parseFloat(query.minPrice); if(query.maxPrice) filter.price.$lte=parseFloat(query.maxPrice); }
  if (query.rating) filter.rating = { $gte:parseFloat(query.rating) };
  if (query.inStock==='true') filter.stock = { $gt:0 };
  if (query.featured==='true') filter.isFeatured = true;
  return filter;
};
const buildProductSort = (sortBy) => {
  const map = { newest:{createdAt:-1}, oldest:{createdAt:1}, 'price-asc':{discountedPrice:1}, 'price-desc':{discountedPrice:-1}, rating:{rating:-1}, popularity:{soldCount:-1} };
  return map[sortBy] || { createdAt:-1 };
};
const calculateBilling = (items, discount=0) => {
  const subtotal = items.reduce((s,i) => s + i.price*i.quantity, 0);
  const taxRate = 0.18; const shipping = subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal*taxRate); const total = Math.round(subtotal+tax+shipping-discount);
  return { subtotal, tax, shipping, discount, total };
};
const sanitizeUser = (user) => {
  const u = user.toObject ? user.toObject() : {...user};
  ['password','refreshToken','resetPasswordToken','resetPasswordExpire','emailVerificationToken','emailVerificationExpire','loginAttempts','lockUntil'].forEach(k => delete u[k]);
  return u;
};
module.exports = { sendSuccess, sendError, getPaginationData, buildProductFilter, buildProductSort, calculateBilling, sanitizeUser };
