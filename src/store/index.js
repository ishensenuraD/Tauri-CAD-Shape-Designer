import { configureStore } from '@reduxjs/toolkit';
import shapeReducer from './shapeSlice';

export const store = configureStore({
  reducer: {
    shape: shapeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
