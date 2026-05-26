import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RoutePoint } from '@/services/directionsService';

export type { RoutePoint };

export interface PlaceResult {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
}

export type VehicleType = 'economy' | 'xl' | 'premium';

export type TripStatus =
  | 'idle'
  | 'searching'
  | 'confirmed'
  | 'finding_driver'
  | 'driver_en_route'
  | 'arrived'
  | 'completed';

export interface DriverPosition {
  latitude: number;
  longitude: number;
}

interface TripState {
  origin: PlaceResult | null;
  destination: PlaceResult | null;
  selectedVehicle: VehicleType | null;
  estimatedFare: number | null;
  status: TripStatus;
  routePoints: RoutePoint[] | null;
  distanceKm: number | null;
  durationMin: number | null;
  driverPosition: DriverPosition | null;
}

const initialState: TripState = {
  origin: null,
  destination: null,
  selectedVehicle: null,
  estimatedFare: null,
  status: 'idle',
  routePoints: null,
  distanceKm: null,
  durationMin: null,
  driverPosition: null,
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
    setRoutePoints(state, action: PayloadAction<RoutePoint[] | null>) {
      state.routePoints = action.payload;
    },
    setDistanceKm(state, action: PayloadAction<number | null>) {
      state.distanceKm = action.payload;
    },
    setDurationMin(state, action: PayloadAction<number | null>) {
      state.durationMin = action.payload;
    },
    setDriverPosition(state, action: PayloadAction<DriverPosition | null>) {
      state.driverPosition = action.payload;
    },
    resetTrip(state) {
      state.origin = null;
      state.destination = null;
      state.selectedVehicle = null;
      state.estimatedFare = null;
      state.status = 'idle';
      state.routePoints = null;
      state.distanceKm = null;
      state.durationMin = null;
      state.driverPosition = null;
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setSelectedVehicle,
  setEstimatedFare,
  setTripStatus,
  setRoutePoints,
  setDistanceKm,
  setDurationMin,
  setDriverPosition,
  resetTrip,
} = tripSlice.actions;

export default tripSlice.reducer;
