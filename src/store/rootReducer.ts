import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import profileReducer from './profileSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  // ride: rideReducer, - Phase 2
});
