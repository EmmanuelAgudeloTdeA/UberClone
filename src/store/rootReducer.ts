import { combineReducers } from '@reduxjs/toolkit';

// Slice reducers are imported here as each phase adds them:
// Phase 1.2 → authReducer
// Phase 2   → rideReducer

export const rootReducer = combineReducers({
  // auth: authReducer,
});
