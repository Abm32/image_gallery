import { addNotification } from '../store/slices/notificationsSlice';
import { store } from '../store/store';

export const notify = {
  success: (message: string) => {
    store.dispatch(addNotification({ message, type: 'success' }));
  },
  error: (message: string) => {
    store.dispatch(addNotification({ message, type: 'error' }));
  },
  warning: (message: string) => {
    store.dispatch(addNotification({ message, type: 'warning' }));
  },
  info: (message: string) => {
    store.dispatch(addNotification({ message, type: 'info' }));
  },
};