import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  job?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomersState {
  items: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: CustomersState = {
  items: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  searchQuery: ''
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.items.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.items.findIndex(customer => customer.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    }
  }
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  setSelectedCustomer,
  setLoading,
  setError,
  setSearchQuery
} = customersSlice.actions;

export default customersSlice.reducer;