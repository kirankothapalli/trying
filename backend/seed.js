/**
 * ShopSphere Database Seeder
 * Run: node seed.js
 * Run with reset: node seed.js --reset
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const { Category, Coupon } = require('./models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere';

const categories = [
  { name: 'Electronics', description: 'Gadgets, devices & tech accessories' },
  { name: 'Fashion', description: 'Clothing, shoes & accessories' },
  { name: 'Home & Living', description: 'Furniture, decor & kitchen essentials' },
  { name: 'Sports & Fitness', description: 'Equipment, clothing & accessories' },
  { name: 'Books', description: 'Fiction, non-fiction & educational' },
  { name: 'Beauty & Health', description: 'Skincare, haircare & wellness' },
];

const generateProducts = (cats) => [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life and crystal clear hands-free calling. Features Speak-to-Chat technology and multipoint connection.',
    shortDescription: 'Best-in-class noise cancellation with 30hr battery',
    price: 29990,
    discountPercent: 15,
    category: cats.Electronics,
    brand: 'Sony',
    stock: 45,
    rating: 4.8,
    numReviews: 2456,
    isFeatured: true,
    soldCount: 850,
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', alt: 'Sony WH-1000XM5', isPrimary: true }],
    specifications: [
      { key: 'Battery Life', value: '30 Hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.2' },
      { key: 'Weight', value: '250g' },
      { key: 'Driver Size', value: '30mm' },
    ],
  },
  {
    name: 'Apple iPhone 15 Pro 256GB',
    description: 'The most powerful iPhone ever. Features the A17 Pro chip, a customizable Action button, and a revolutionary titanium design with a 48MP main camera system.',
    shortDescription: 'Titanium design, A17 Pro chip, 48MP camera',
    price: 134900,
    discountPercent: 5,
    category: cats.Electronics,
    brand: 'Apple',
    stock: 30,
    rating: 4.9,
    numReviews: 5832,
    isFeatured: true,
    soldCount: 1200,
    tags: ['iphone', 'apple', 'smartphone', '5g'],
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', alt: 'iPhone 15 Pro', isPrimary: true }],
    specifications: [
      { key: 'Chip', value: 'A17 Pro' },
      { key: 'Storage', value: '256GB' },
      { key: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
      { key: 'Display', value: '6.1" Super Retina XDR' },
    ],
  },
  {
    name: 'Samsung 4K OLED Smart TV 55"',
    description: 'Experience stunning 4K OLED picture quality with HDR support. Smart TV features include Netflix, Prime Video, Disney+, and voice control via Alexa and Google Assistant.',
    price: 89990,
    discountPercent: 20,
    category: cats.Electronics,
    brand: 'Samsung',
    stock: 15,
    rating: 4.7,
    numReviews: 892,
    isFeatured: true,
    soldCount: 340,
    tags: ['tv', 'oled', '4k', 'smart-tv', 'samsung'],
    images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', alt: 'Samsung OLED TV', isPrimary: true }],
  },
  {
    name: 'Nike Air Max 270 Sneakers',
    description: 'The Nike Air Max 270 draws inspiration from Air Max icons, delivering a bold shoe with the tallest Air unit yet. Breathable mesh upper, foam midsole for lightweight cushioning.',
    price: 12995,
    discountPercent: 10,
    category: cats.Fashion,
    brand: 'Nike',
    stock: 80,
    rating: 4.6,
    numReviews: 3421,
    isFeatured: true,
    soldCount: 2100,
    tags: ['shoes', 'nike', 'air-max', 'sneakers', 'running'],
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Nike Air Max 270', isPrimary: true }],
    specifications: [
      { key: 'Upper', value: 'Mesh + Synthetic' },
      { key: 'Sole', value: 'Rubber' },
      { key: 'Closure', value: 'Lace-up' },
    ],
  },
  {
    name: "Levi's 501 Original Fit Jeans",
    description: "The original jean since 1873. Button fly, straight leg, regular fit through seat and thigh. Made with 99% cotton denim for authentic style and lasting durability.",
    price: 4999,
    discountPercent: 25,
    category: cats.Fashion,
    brand: "Levi's",
    stock: 120,
    rating: 4.4,
    numReviews: 7823,
    soldCount: 4500,
    tags: ['jeans', 'levis', 'denim', '501'],
    images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', alt: "Levi's 501 Jeans", isPrimary: true }],
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Reveals microscopic dust you cannot see. Laser Detect technology, up to 60 minutes run time, HEPA filtration captures 99.97% of particles as small as 0.3 microns.',
    price: 52900,
    discountPercent: 8,
    category: cats['Home & Living'],
    brand: 'Dyson',
    stock: 25,
    rating: 4.9,
    numReviews: 1256,
    isFeatured: true,
    soldCount: 420,
    tags: ['vacuum', 'dyson', 'cordless', 'cleaning'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Dyson V15', isPrimary: true }],
  },
  {
    name: 'IKEA POÄNG Armchair',
    description: 'A comfortable armchair with a timeless design. The layer-glued bent birch frame gives this chair a comfortable resilience. Comes with a washable cover.',
    price: 8999,
    discountPercent: 0,
    category: cats['Home & Living'],
    brand: 'IKEA',
    stock: 60,
    rating: 4.5,
    numReviews: 2100,
    soldCount: 890,
    tags: ['chair', 'armchair', 'ikea', 'furniture'],
    images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', alt: 'IKEA Armchair', isPrimary: true }],
  },
  {
    name: 'Yoga Mat Premium Non-Slip',
    description: '6mm thick eco-friendly TPE yoga mat. Non-slip surface, moisture-resistant, lightweight at 1.5kg. Includes carrying strap. Perfect for yoga, pilates and home workouts.',
    price: 1499,
    discountPercent: 30,
    category: cats['Sports & Fitness'],
    brand: 'HealthFit',
    stock: 200,
    rating: 4.3,
    numReviews: 4567,
    soldCount: 3200,
    tags: ['yoga', 'mat', 'fitness', 'exercise'],
    images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', alt: 'Yoga Mat', isPrimary: true }],
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'The #1 New York Times bestseller. No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies for forming good habits.',
    price: 699,
    discountPercent: 35,
    category: cats.Books,
    brand: 'Avery Publishing',
    stock: 500,
    rating: 4.9,
    numReviews: 12450,
    isFeatured: true,
    soldCount: 8900,
    tags: ['book', 'self-help', 'habits', 'bestseller'],
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', alt: 'Atomic Habits Book', isPrimary: true }],
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description: 'High-strength vitamin and mineral blemish formula. Niacinamide (Vitamin B3) 10% targets textural irregularities. Zinc 1% balances visible aspects of sebum activity.',
    price: 599,
    discountPercent: 0,
    category: cats['Beauty & Health'],
    brand: 'The Ordinary',
    stock: 350,
    rating: 4.7,
    numReviews: 6234,
    soldCount: 5100,
    tags: ['skincare', 'niacinamide', 'serum', 'face'],
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', alt: 'The Ordinary Serum', isPrimary: true }],
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    description: 'Supercharged by M3 Pro chip for extraordinary performance. 18-hour battery life, Liquid Retina XDR display, all-day battery, and 18GB unified memory for powerful workflows.',
    price: 199990,
    discountPercent: 3,
    category: cats.Electronics,
    brand: 'Apple',
    stock: 12,
    rating: 4.9,
    numReviews: 2103,
    isFeatured: true,
    soldCount: 230,
    tags: ['laptop', 'macbook', 'apple', 'm3', 'pro'],
    images: [{ url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', alt: 'MacBook Pro', isPrimary: true }],
  },
  {
    name: 'Protein Whey Isolate 2kg',
    description: 'Premium whey protein isolate with 27g protein per serving, <1g fat, <1g sugar. Lab tested for purity. Available in Chocolate, Vanilla and Strawberry flavors.',
    price: 3499,
    discountPercent: 20,
    category: cats['Sports & Fitness'],
    brand: 'MuscleBlaze',
    stock: 180,
    rating: 4.5,
    numReviews: 8932,
    soldCount: 6700,
    tags: ['protein', 'whey', 'supplement', 'fitness', 'gym'],
    images: [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600', alt: 'Protein Powder', isPrimary: true }],
  },
];

const coupons = [
  {
    code: 'WELCOME20',
    description: 'Welcome discount for new users',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 500,
    usageLimit: 1000,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FLAT200',
    description: 'Flat ₹200 off on orders above ₹1999',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1999,
    isActive: true,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'SUMMER30',
    description: 'Summer sale - 30% off (max ₹1000)',
    discountType: 'percentage',
    discountValue: 30,
    minOrderAmount: 999,
    maxDiscount: 1000,
    usageLimit: 500,
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
];

async function seed() {
  try {
    console.log('\n🌱 ShopSphere Database Seeder\n');
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    const reset = process.argv.includes('--reset');

    if (reset) {
      console.log('🗑️  Clearing existing data...');
      await Promise.all([
        User.deleteMany({}),
        Product.deleteMany({}),
        Category.deleteMany({}),
        Coupon.deleteMany({}),
      ]);
      console.log('✅ Data cleared\n');
    }

    // ── Seed Categories ────────────────────────────────────────────────────────
    console.log('📦 Seeding categories...');
    const catDocs = {};
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        catDocs[cat.name] = existing._id;
        console.log(`  ⏭️  Category "${cat.name}" already exists`);
      } else {
        const doc = await Category.create(cat);
        catDocs[cat.name] = doc._id;
        console.log(`  ✅ Created: ${cat.name}`);
      }
    }

    // ── Seed Admin User ────────────────────────────────────────────────────────
    console.log('\n👤 Seeding admin user...');
    const adminEmail = 'admin@shopsphere.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      });
      console.log('  ✅ Admin created: admin@shopsphere.com / Admin@123');
    } else {
      console.log('  ⏭️  Admin already exists');
    }

    // ── Seed Demo User ─────────────────────────────────────────────────────────
    console.log('\n👤 Seeding demo user...');
    const demoEmail = 'demo@shopsphere.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: 'Demo@123',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        phone: '+91 9876543210',
        addresses: [{
          label: 'Home',
          street: '123 MG Road',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500001',
          country: 'India',
          isDefault: true,
        }],
      });
      console.log('  ✅ Demo user created: demo@shopsphere.com / Demo@123');
    } else {
      console.log('  ⏭️  Demo user already exists');
    }

    // ── Seed Products ──────────────────────────────────────────────────────────
    console.log('\n🛍️  Seeding products...');
    const products = generateProducts(catDocs);
    let created = 0, skipped = 0;
    for (const product of products) {
      const existing = await Product.findOne({ name: product.name });
      if (existing) { skipped++; continue; }
      // Calculate discounted price
      product.discountedPrice = product.discountPercent > 0
        ? Math.round(product.price * (1 - product.discountPercent / 100))
        : product.price;
      // Generate SKU
      product.sku = 'SKU-' + product.brand.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3) + '-' + Date.now().toString().slice(-6);
      // Generate slug
      product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      await Product.create(product);
      created++;
      console.log(`  ✅ Created: ${product.name}`);
    }
    if (skipped > 0) console.log(`  ⏭️  ${skipped} products already exist`);

    // ── Seed Coupons ───────────────────────────────────────────────────────────
    console.log('\n🎟️  Seeding coupons...');
    for (const coupon of coupons) {
      const existing = await Coupon.findOne({ code: coupon.code });
      if (existing) {
        console.log(`  ⏭️  Coupon "${coupon.code}" already exists`);
      } else {
        await Coupon.create(coupon);
        console.log(`  ✅ Created: ${coupon.code}`);
      }
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('━'.repeat(50));
    console.log('📋 Test Credentials:');
    console.log('   Admin:  admin@shopsphere.com  / Admin@123');
    console.log('   User:   demo@shopsphere.com   / Demo@123');
    console.log('\n🎟️  Test Coupons:');
    console.log('   WELCOME20 - 20% off (max ₹500)');
    console.log('   FLAT200   - ₹200 off (min ₹1999)');
    console.log('   SUMMER30  - 30% off (max ₹1000)');
    console.log('━'.repeat(50) + '\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
