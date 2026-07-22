const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
router.get('/', protect, authorize('admin'), async(req,res) => {
  const products = await Product.find({'reviews.0':{$exists:true}}).select('name reviews').populate('reviews.user','name').lean();
  const reviews = products.flatMap(p => p.reviews.map(r => ({...r, productName:p.name, productId:p._id})));
  res.json({success:true, data:reviews});
});
module.exports = router;
