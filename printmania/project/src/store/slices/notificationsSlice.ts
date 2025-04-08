import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  read: boolean;
  timestamp: number;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;