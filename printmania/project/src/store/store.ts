import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from './slices/notificationsSlice';
import ordersReducer from './slices/ordersSlice';
import tasksReducer from './slices/tasksSlice';
import userReducer from './slices/userSlice';
import financeReducer from './slices/financeSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    orders: ordersReducer,
    tasks: tasksReducer,
    user: userReducer,
    finance: financeReducer,
    customers: customersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['user/setUser'],
        ignoredPaths: ['user.currentUser'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;