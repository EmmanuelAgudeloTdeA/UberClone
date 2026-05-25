import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlaceResult {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
}

export type VehicleType = 'economy' | 'comfort' | 'xl';

export type TripStatus = 'idle' | 'searching' | 'confirmed';

interface TripState {
  origin: PlaceResult | null;
  destination: PlaceResult | null;
  selectedVehicle: VehicleType | null;
  estimatedFare: number | null;
  status: TripStatus;
}

const initialState: TripState = {
  origin: null,
  destination: null,
  selectedVehicle: null,
  estimatedFare: null,
  status: 'idle',
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setOrigin(state, action: PayloadAction<PlaceResult | null>) {
      state.origin = action.payload;
    },
    setDestination(state, action: PayloadAction<PlaceResult | null>) {
      state.destination = action.payload;
      state.status = action.payload ? 'searching' : 'idle';
    },
    setSelectedVehicle(state, action: PayloadAction<VehicleType | null>) {
      state.selectedVehicle = action.payload;
    },
    setEstimatedFare(state, action: PayloadAction<number | null>) {
      state.estimatedFare = action.payload;
    },
    setTripStatus(state, action: PayloadAction<TripStatus>) {
      state.status = action.payload;
    },
    resetTrip(state) {
      state.origin = null;
      state.destination = null;
      state.selectedVehicle = null;
      state.estimatedFare = null;
      state.status = 'idle';
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setSelectedVehicle,
  setEstimatedFare,
  setTripStatus,
  resetTrip,
} = tripSlice.actions;

export default tripSlice.reducer;
