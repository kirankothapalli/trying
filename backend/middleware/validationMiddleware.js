const { body, param, validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 400, 'Validation Error', errors.array().map((e) => ({ field: e.path, message: e.msg })));
  next();
};
const registerValidator = [
  body('name').trim().isLength({ min:2, max:50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min:8 }).withMessage('Password min 8 chars').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Must have upper, lower & number'),
  handleValidation,
];
const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidation,
];
const forgotPasswordValidator = [ body('email').isEmail().normalizeEmail().withMessage('Valid email required'), handleValidation ];
const resetPasswordValidator = [
  body('password').isLength({ min:8 }).withMessage('Min 8 chars').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Upper, lower & number required'),
  handleValidation,
];
const productValidator = [
  body('name').trim().isLength({ min:2, max:100 }).withMessage('Name 2-100 chars'),
  body('description').trim().isLength({ min:10 }).withMessage('Description min 10 chars'),
  body('price').isFloat({ min:0 }).withMessage('Price must be positive'),
  body('stock').isInt({ min:0 }).withMessage('Stock non-negative integer'),
  body('brand').trim().notEmpty().withMessage('Brand required'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  handleValidation,
];
const reviewValidator = [
  body('rating').isInt({ min:1, max:5 }).withMessage('Rating 1-5'),
  body('comment').trim().isLength({ min:5, max:500 }).withMessage('Comment 5-500 chars'),
  handleValidation,
];
const cartValidator = [
  body('productId').isMongoId().withMessage('Valid product ID required'),
  body('quantity').isInt({ min:1 }).withMessage('Quantity min 1'),
  handleValidation,
];
const orderValidator = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('ZIP required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country required'),
  body('paymentMethod').isIn(['stripe','razorpay','cod']).withMessage('Invalid payment method'),
  handleValidation,
];
module.exports = { handleValidation, registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, productValidator, reviewValidator, cartValidator, orderValidator };
