# 🛒 ShopSphere — Full-Stack E-Commerce Platform

<div align="center">

![ShopSphere Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop)

**A production-grade, full-stack e-commerce web application**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Features

### 🧑‍💼 Customer Features
- 🔐 **Authentication** — JWT + Refresh Tokens, email verification, forgot/reset password
- 🛍️ **Product Browsing** — Search, filter, sort, paginate products
- 🔍 **Live Search** — Full-text search with debouncing
- 🛒 **Shopping Cart** — Add/remove/update, persistent, coupon support
- ❤️ **Wishlist** — Save products for later
- 💳 **Checkout** — Address management, multiple payment methods
- 💰 **Payments** — Stripe, Razorpay, Cash on Delivery
- 📦 **Order Tracking** — Full order history, status timeline, cancellation
- 👤 **Profile** — Edit info, change password, manage addresses
- ⭐ **Reviews & Ratings** — Write and browse product reviews

### 🔧 Admin Features
- 📊 **Analytics Dashboard** — Revenue charts, order stats, top products
- 📦 **Product Management** — Full CRUD with images
- 🗂️ **Category Management** — Create and organise categories
- 🛒 **Order Management** — View, update status, add tracking numbers
- 👥 **User Management** — Role control, activate/deactivate
- 🎟️ **Coupon System** — Percentage & fixed discounts, expiry, usage limits

### ⚡ Technical Highlights
- 🔒 Security: Helmet, CORS, rate limiting, XSS protection, bcrypt
- 📱 Fully responsive (mobile-first)
- 🎨 Dark mode UI with Tailwind CSS
- 🚀 Code splitting + lazy loading
- 🧪 Jest + Supertest API tests
- 📧 Email notifications (Nodemailer)
- 🔄 Token refresh with HTTP-only cookies

---

## 🏗️ Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 18, Vite, Redux Toolkit, Tailwind CSS       |
| Backend     | Node.js, Express.js                               |
| Database    | MongoDB, Mongoose                                 |
| Auth        | JWT (Access + Refresh), bcryptjs                  |
| Payments    | Stripe, Razorpay                                  |
| Email       | Nodemailer                                        |
| Charts      | Recharts                                          |
| Animations  | Framer Motion                                     |
| Forms       | React Hook Form                                   |
| Testing     | Jest, Supertest                                   |

---

## 📁 Project Structure

```
shopsphere/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/                 # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   └── ui/              # ProductCard, Modal, Spinner, etc.
│   │   ├── layouts/             # MainLayout, AdminLayout
│   │   ├── pages/               # All page components
│   │   │   └── admin/           # Admin panel pages
│   │   ├── store/
│   │   │   └── slices/          # Redux slices (auth, cart, etc.)
│   │   └── styles/              # Global CSS
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                     # Node.js + Express API
    ├── config/                  # DB connection
    ├── controllers/             # Business logic
    ├── middleware/              # Auth, error, validation
    ├── models/                  # Mongoose schemas
    ├── routes/                  # API route definitions
    ├── utils/                   # JWT, email, helpers
    ├── __tests__/               # API test suite
    ├── seed.js                  # Database seeder
    └── server.js                # App entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/shopsphere.git
cd shopsphere

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

This creates:
- **Admin:** `admin@shopsphere.com` / `Admin@123`
- **Demo User:** `demo@shopsphere.com` / `Demo@123`
- 12 sample products across 6 categories
- 3 test coupons: `WELCOME20`, `FLAT200`, `SUMMER30`

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST /api/auth/register          Register new user
POST /api/auth/login             Login
POST /api/auth/logout            Logout (protected)
POST /api/auth/refresh-token     Refresh access token
GET  /api/auth/me                Get current user (protected)
GET  /api/auth/verify-email/:t   Verify email
POST /api/auth/forgot-password   Send reset email
POST /api/auth/reset-password/:t Reset password
```

### Products
```
GET    /api/products             List products (search, filter, sort, paginate)
GET    /api/products/featured    Featured products
GET    /api/products/:id         Single product
POST   /api/products             Create product (admin)
PUT    /api/products/:id         Update product (admin)
DELETE /api/products/:id         Delete product (admin)
POST   /api/products/:id/reviews Add review (protected)
DELETE /api/products/:id/reviews/:rId Delete review (protected)
GET    /api/products/:id/related Related products
```

### Cart
```
GET    /api/cart                 Get user cart (protected)
POST   /api/cart/add             Add item (protected)
PUT    /api/cart/item/:itemId    Update quantity (protected)
DELETE /api/cart/item/:itemId    Remove item (protected)
DELETE /api/cart/clear           Clear cart (protected)
```

### Wishlist
```
GET  /api/wishlist               Get wishlist (protected)
POST /api/wishlist/toggle        Toggle product (protected)
```

### Orders
```
POST /api/orders                 Create order (protected)
GET  /api/orders                 User's orders (protected)
GET  /api/orders/:id             Order detail (protected)
PUT  /api/orders/:id/cancel      Cancel order (protected)
```

### Payments
```
POST /api/payments/stripe/create-intent   Create Stripe intent
POST /api/payments/stripe/confirm         Confirm Stripe payment
POST /api/payments/razorpay/create-order  Create Razorpay order
POST /api/payments/razorpay/verify        Verify Razorpay signature
```

### Admin
```
GET /api/admin/dashboard         Analytics dashboard (admin)
GET /api/admin/users             All users (admin)
PUT /api/admin/users/:id/role    Change role (admin)
PUT /api/admin/users/:id/toggle-status  Toggle user (admin)
GET /api/admin/orders            All orders (admin)
PUT /api/admin/orders/:id/status Update order status (admin)
```

### Query Parameters (Products)
```
?search=keyword          Full-text search
?category=id             Filter by category
?brand=name              Filter by brand
?minPrice=0&maxPrice=999 Price range
?rating=4                Min rating
?inStock=true            In-stock only
?featured=true           Featured only
?sort=newest|price-asc|price-desc|rating|popularity
?page=1&limit=12         Pagination
```

---

## 🧪 Testing

```bash
cd backend
npm test              # Run all tests
npm run test:coverage # With coverage report
```

---

## 📦 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render / Railway

1. Push code to GitHub
2. Connect Render to your repository
3. Set environment variables in Render dashboard
4. Set build command: `npm install`
5. Set start command: `npm start`

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist your server IP
3. Update `MONGO_URI` with your Atlas connection string

---

## 🎟️ Test Coupons

| Code       | Type       | Value | Min Order | Max Discount |
|------------|------------|-------|-----------|--------------|
| WELCOME20  | Percentage | 20%   | ₹500      | ₹500         |
| FLAT200    | Fixed      | ₹200  | ₹1,999    | —            |
| SUMMER30   | Percentage | 30%   | ₹999      | ₹1,000       |

---

## 📄 License

MIT License — built for educational and internship submission purposes.

---

<div align="center">
Made with ❤️ by ShopSphere Team
</div>
