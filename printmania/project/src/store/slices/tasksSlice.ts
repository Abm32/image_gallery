import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  orderId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  userId: string;
  orderDetails?: {
    productName: string;
    quantity: number;
    deadline: string;
  };
  createdAt: string;
}

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  selectedTask: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(task => task.id !== action.payload);
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
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
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setSelectedTask,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;