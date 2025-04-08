import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  productName: string;
  amount: number;
  gst: number;
  createdAt: string;
  status: string;
  paymentDate?: string;
}

export interface FinanceStats {
  totalRevenue: number;
  pendingPayments: number;
  totalGst: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

interface FinanceState {
  transactions: Transaction[];
  stats: FinanceStats;
  loading: boolean;
  error: string | null;
  timeframe: 'monthly' | 'yearly';
}

const initialStats: FinanceStats = {
  totalRevenue: 0,
  pendingPayments: 0,
  totalGst: 0,
  completedOrders: 0,
  pendingOrders: 0,
  cancelledOrders: 0
};

const initialState: FinanceState = {
  transactions: [],
  stats: initialStats,
  loading: false,
  error: null,
  timeframe: 'monthly'
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setStats: (state, action: PayloadAction<FinanceStats>) => {
      state.stats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTimeframe: (state, action: PayloadAction<'monthly' | 'yearly'>) => {
      state.timeframe = action.payload;
    },
    resetFinance: (state) => {
      state.transactions = [];
      state.stats = initialStats;
      state.error = null;
    }
  }
});

export const {
  setTransactions,
  setStats,
  setLoading,
  setError,
  setTimeframe,
  resetFinance
} = financeSlice.actions;

export default financeSlice.reducer;