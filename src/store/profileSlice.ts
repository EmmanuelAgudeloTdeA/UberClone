import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { SerializableUserProfile } from '@/types/user';

interface ProfileState {
  data: SerializableUserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<SerializableUserProfile | null>) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfileLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setProfileError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProfile, setProfileLoading, setProfileError } = profileSlice.actions;
export default profileSlice.reducer;
