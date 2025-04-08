import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  materials: string;
  status: string;
  amount: number;
  gst: string;
  userId: string;
  completionPercentage?: string;
  paymentReceived?: boolean;
  paymentDate?: string;
  createdAt: string;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.items.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(order => order.id !== action.payload);
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  setLoading,
  setError,
} = ordersSlice.actions;

export default ordersSlice.reducer;