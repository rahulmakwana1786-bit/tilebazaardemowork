import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    orders: orderReducer,
    cart: cartReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;