const request = require('supertest');

// Mock mongoose before requiring app
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'test' } }),
    model: actual.model.bind(actual),
    Schema: actual.Schema,
    Types: actual.Types,
  };
});

const { app } = require('../server');

// Helper to generate unique emails
const uniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@test.com`;

describe('ShopSphere API Tests', () => {
  let accessToken;
  let adminToken;
  let testUserId;
  let testProductId;
  let testOrderId;
  let testCategoryId;

  // ─── AUTH TESTS ─────────────────────────────────────────────────────────────
  describe('Authentication', () => {
    const email = uniqueEmail();

    it('POST /api/auth/register - should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email, password: 'TestPass123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).toHaveProperty('email', email);
      accessToken = res.body.data.accessToken;
      testUserId = res.body.data.user._id;
    });

    it('POST /api/auth/register - should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email, password: 'TestPass123' });
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register - should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: uniqueEmail(), password: 'weak' });
      expect(res.statusCode).toBe(400);
    });

    it('POST /api/auth/login - should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'TestPass123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      accessToken = res.body.data.accessToken;
    });

    it('POST /api/auth/login - should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'WrongPass123' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/auth/me - should return authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('email', email);
    });

    it('GET /api/auth/me - should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/auth/forgot-password - should accept valid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── PRODUCT TESTS ───────────────────────────────────────────────────────────
  describe('Products', () => {
    it('GET /api/products - should return product list', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/products - should support pagination', async () => {
      const res = await request(app).get('/api/products?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('currentPage', 1);
    });

    it('GET /api/products - should support search', async () => {
      const res = await request(app).get('/api/products?search=phone');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/products/featured - should return featured products', async () => {
      const res = await request(app).get('/api/products/featured');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/products - should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test Product', price: 100, description: 'Test desc', brand: 'Test', category: '000000000000000000000000', stock: 10 });
      expect(res.statusCode).toBe(403);
    });

    it('GET /api/products/:id - should return 404 for invalid ID', async () => {
      const res = await request(app).get('/api/products/invalid-id');
      expect([400, 404]).toContain(res.statusCode);
    });
  });

  // ─── CATEGORY TESTS ──────────────────────────────────────────────────────────
  describe('Categories', () => {
    it('GET /api/categories - should return categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── CART TESTS ──────────────────────────────────────────────────────────────
  describe('Cart', () => {
    it('GET /api/cart - should reject unauthenticated', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/cart - should return empty cart for new user', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('POST /api/cart/add - should reject invalid product ID', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: 'invalid', quantity: 1 });
      expect(res.statusCode).toBe(400);
    });
  });

  // ─── WISHLIST TESTS ──────────────────────────────────────────────────────────
  describe('Wishlist', () => {
    it('GET /api/wishlist - should return empty wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/wishlist - should reject unauthenticated', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── ORDER TESTS ─────────────────────────────────────────────────────────────
  describe('Orders', () => {
    it('GET /api/orders - should return user orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/orders - should reject empty cart', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          shippingAddress: {
            fullName: 'Test User', phone: '9999999999',
            street: '123 Test St', city: 'Test City',
            state: 'Test State', zipCode: '500001', country: 'India',
          },
          paymentMethod: 'cod',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cart/i);
    });
  });

  // ─── HEALTH CHECK ────────────────────────────────────────────────────────────
  describe('Health Check', () => {
    it('GET /health - should return 200', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── RATE LIMITING TEST ──────────────────────────────────────────────────────
  describe('Security', () => {
    it('Should reject invalid JWT tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.statusCode).toBe(401);
    });

    it('Should reject malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer token');
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── 404 TEST ────────────────────────────────────────────────────────────────
  describe('Error Handling', () => {
    it('Should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent-route');
      expect(res.statusCode).toBe(404);
    });
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
