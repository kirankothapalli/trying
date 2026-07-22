import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/register', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});
export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/login', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try { await api.post('/auth/logout'); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/auth/me'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const refreshAccessToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try { const res = await api.post('/auth/refresh-token'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try { const res = await api.post('/auth/forgot-password', { email }); return res.data.message; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try { const res = await api.post(`/auth/reset-password/${token}`, { password }); return res.data.message; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try { const res = await api.put('/users/profile', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const getStoredToken = () => { try { return localStorage.getItem('accessToken'); } catch { return null; } };

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: getStoredToken(), isAuthenticated: false, isLoading: false, isInitialized: false, error: null },
  reducers: {
    setCredentials: (state, action) => { state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.isAuthenticated = true; localStorage.setItem('accessToken', action.payload.accessToken); },
    clearAuth: (state) => { state.user = null; state.accessToken = null; state.isAuthenticated = false; localStorage.removeItem('accessToken'); },
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.isInitialized = true; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload.user; s.accessToken = a.payload.accessToken; s.isAuthenticated = true; s.isInitialized = true; localStorage.setItem('accessToken', a.payload.accessToken); toast.success('Welcome to ShopSphere! 🎉'); })
      .addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; toast.error(a.payload); })
      .addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload.user; s.accessToken = a.payload.accessToken; s.isAuthenticated = true; s.isInitialized = true; localStorage.setItem('accessToken', a.payload.accessToken); toast.success(`Welcome back, ${a.payload.user.name}! 👋`); })
      .addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; toast.error(a.payload); })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.accessToken = null; s.isAuthenticated = false; localStorage.removeItem('accessToken'); toast.success('Logged out'); })
      .addCase(fetchCurrentUser.pending, (s) => { s.isLoading = true; })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload; s.isAuthenticated = true; s.isInitialized = true; })
      .addCase(fetchCurrentUser.rejected, (s) => { s.isLoading = false; s.isAuthenticated = false; s.isInitialized = true; localStorage.removeItem('accessToken'); })
      .addCase(refreshAccessToken.fulfilled, (s, a) => { s.accessToken = a.payload.accessToken; localStorage.setItem('accessToken', a.payload.accessToken); })
      .addCase(refreshAccessToken.rejected, (s) => { s.user = null; s.accessToken = null; s.isAuthenticated = false; localStorage.removeItem('accessToken'); })
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; toast.success('Profile updated'); })
      .addCase(updateProfile.rejected, (_, a) => { toast.error(a.payload); });
  },
});

export const { setCredentials, clearAuth, clearError, setInitialized } = authSlice.actions;
export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectIsAdmin = (s) => s.auth.user?.role === 'admin';
export const selectAccessToken = (s) => s.auth.accessToken;
export default authSlice.reducer;
