import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SerializableUser {
  uid: string;
  email: string | null;
}

interface AuthState {
  user: SerializableUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SerializableUser | null>) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { setUser, setAuthLoading, setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
