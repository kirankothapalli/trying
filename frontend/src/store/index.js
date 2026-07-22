import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { cartReducer, wishlistReducer, productReducer, orderReducer, uiReducer } from './allSlices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
});

export default store;
