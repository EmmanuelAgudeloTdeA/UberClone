import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  // ride: rideReducer, - Phase 2
});
