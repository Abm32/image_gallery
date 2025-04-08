import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';

interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
}

interface UserState {
  currentUser: SerializableUser | null;
  loading: boolean;
  error: string | null;
  productKeyValid: boolean;
  productKeyExpirationDate: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  productKeyValid: false,
  productKeyExpirationDate: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.currentUser = {
          uid: action.payload.uid,
          email: action.payload.email,
          displayName: action.payload.displayName,
          emailVerified: action.payload.emailVerified,
          photoURL: action.payload.photoURL,
        };
      } else {
        state.currentUser = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProductKeyStatus: (state, action: PayloadAction<{ valid: boolean; expirationDate: string | null }>) => {
      state.productKeyValid = action.payload.valid;
      state.productKeyExpirationDate = action.payload.expirationDate;
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  setProductKeyStatus,
} = userSlice.actions;

export default userSlice.reducer;