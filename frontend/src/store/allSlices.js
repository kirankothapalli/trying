import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── CART ─────────────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/cart'); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { await api.post('/cart/add', data); return data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to add'); }
});
export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { await api.put(`/cart/item/${itemId}`, { quantity }); return { itemId, quantity }; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { await api.delete(`/cart/item/${itemId}`); return itemId; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const clearCartThunk = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await api.delete('/cart/clear'); } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try { const r = await api.post('/coupons/apply', { code }); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Invalid coupon'); }
});
export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try { await api.post('/coupons/remove'); } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], billing: null, couponCode: '', couponDiscount: 0, isLoading: false },
  reducers: { resetCart: (s) => { s.items = []; s.billing = null; s.couponCode = ''; s.couponDiscount = 0; } },
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.isLoading = true; })
     .addCase(fetchCart.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload?.items || []; s.billing = a.payload?.billing || null; s.couponCode = a.payload?.couponCode || ''; s.couponDiscount = a.payload?.couponDiscount || 0; })
     .addCase(fetchCart.rejected, (s) => { s.isLoading = false; })
     .addCase(addToCart.fulfilled, () => { toast.success('Added to cart! 🛒'); })
     .addCase(addToCart.rejected, (_, a) => { toast.error(a.payload || 'Failed'); })
     .addCase(removeFromCart.fulfilled, () => { toast.success('Removed from cart'); })
     .addCase(clearCartThunk.fulfilled, (s) => { s.items = []; s.billing = null; })
     .addCase(applyCoupon.fulfilled, (s, a) => { s.couponDiscount = a.payload.discount; s.couponCode = a.payload.code; toast.success(`Coupon applied! You save ₹${a.payload.discount}`); })
     .addCase(applyCoupon.rejected, (_, a) => { toast.error(a.payload); })
     .addCase(removeCoupon.fulfilled, (s) => { s.couponCode = ''; s.couponDiscount = 0; });
  },
});
export const { resetCart } = cartSlice.actions;
export const selectCart = (s) => s.cart;
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const cartReducer = cartSlice.reducer;

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/wishlist'); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { const r = await api.post('/wishlist/toggle', { productId }); return { productId, inWishlist: r.data.data.inWishlist }; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], isLoading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchWishlist.fulfilled, (s, a) => { s.items = a.payload || []; })
     .addCase(toggleWishlist.fulfilled, (s, a) => {
       const { productId, inWishlist } = a.payload;
       if (inWishlist) { toast.success('Added to wishlist ❤️'); }
       else { s.items = s.items.filter((p) => (p._id || p) !== productId); toast.success('Removed from wishlist'); }
     })
     .addCase(toggleWishlist.rejected, (_, a) => { toast.error(a.payload || 'Please login'); });
  },
});
export const selectWishlist = (s) => s.wishlist.items;
export const selectIsInWishlist = (productId) => (s) => s.wishlist.items.some((p) => (p._id || p) === productId);
export const wishlistReducer = wishlistSlice.reducer;

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try { const r = await api.get('/products', { params }); return { products: r.data.data, meta: r.data.meta }; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchProductDetail = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const r = await api.get(`/products/${id}`); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/products/featured'); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/categories'); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], featured: [], categories: [], currentProduct: null, meta: null, isLoading: false, error: null, filters: { category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', search: '', inStock: '' } },
  reducers: {
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    resetFilters: (s) => { s.filters = { category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', search: '', inStock: '' }; },
    clearCurrentProduct: (s) => { s.currentProduct = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(fetchProducts.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.products; s.meta = a.payload.meta; })
     .addCase(fetchProducts.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
     .addCase(fetchProductDetail.pending, (s) => { s.isLoading = true; s.currentProduct = null; })
     .addCase(fetchProductDetail.fulfilled, (s, a) => { s.isLoading = false; s.currentProduct = a.payload; })
     .addCase(fetchProductDetail.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
     .addCase(fetchFeaturedProducts.fulfilled, (s, a) => { s.featured = a.payload; })
     .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload; });
  },
});
export const { setFilters, resetFilters, clearCurrentProduct } = productSlice.actions;
export const selectProducts = (s) => s.products;
export const productReducer = productSlice.reducer;

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/orders', data); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Order failed'); }
});
export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try { const r = await api.get('/orders', { params }); return { orders: r.data.data, meta: r.data.meta }; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const r = await api.get(`/orders/${id}`); return r.data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try { await api.put(`/orders/${id}/cancel`, { reason }); return id; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], currentOrder: null, meta: null, isLoading: false, error: null },
  reducers: { clearCurrentOrder: (s) => { s.currentOrder = null; } },
  extraReducers: (b) => {
    b.addCase(createOrder.pending, (s) => { s.isLoading = true; })
     .addCase(createOrder.fulfilled, (s, a) => { s.isLoading = false; s.currentOrder = a.payload; })
     .addCase(createOrder.rejected, (s, a) => { s.isLoading = false; toast.error(a.payload); })
     .addCase(fetchMyOrders.pending, (s) => { s.isLoading = true; })
     .addCase(fetchMyOrders.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.orders; s.meta = a.payload.meta; })
     .addCase(fetchMyOrders.rejected, (s) => { s.isLoading = false; })
     .addCase(fetchOrderById.fulfilled, (s, a) => { s.currentOrder = a.payload; })
     .addCase(cancelOrder.fulfilled, (s, a) => { const o = s.items.find((x) => x._id === a.payload); if (o) o.orderStatus = 'cancelled'; toast.success('Order cancelled'); })
     .addCase(cancelOrder.rejected, (_, a) => { toast.error(a.payload); });
  },
});
export const { clearCurrentOrder } = orderSlice.actions;
export const selectOrders = (s) => s.orders;
export const orderReducer = orderSlice.reducer;

// ─── UI ───────────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false, mobileMenuOpen: false, searchOpen: false },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    setSidebarOpen: (s, a) => { s.sidebarOpen = a.payload; },
    toggleMobileMenu: (s) => { s.mobileMenuOpen = !s.mobileMenuOpen; },
    toggleSearch: (s) => { s.searchOpen = !s.searchOpen; },
  },
});
export const { toggleSidebar, setSidebarOpen, toggleMobileMenu, toggleSearch } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
