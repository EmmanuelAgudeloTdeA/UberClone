import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import profileReducer from './profileSlice';
import tripReducer from './tripSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  trip: tripReducer,
});
