const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const app = express();
connectDB();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const limiter = rateLimit({ windowMs: 15*60*1000, max: 200, message: { success:false, message:'Too many requests' }, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: { success:false, message:'Too many auth attempts' } });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5173'];
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true, 
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], 
  allowedHeaders: ['Content-Type','Authorization'] 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/health', (req, res) => res.status(200).json({ success:true, message:'ShopSphere API running', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);

// Temporary endpoint to seed the database
app.get('/api/seed-trigger', async (req, res) => {
  try {
    const { seed } = require('./seed');
    await seed(true);
    res.json({ success: true, message: 'Database successfully seeded and reset!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 ShopSphere API on port ${PORT}`));
process.on('unhandledRejection', (err) => { console.error(err.message); server.close(() => process.exit(1)); });
module.exports = { app, server };
