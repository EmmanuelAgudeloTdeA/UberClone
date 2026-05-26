import { VehicleType } from '@/store/tripSlice';

export const BASE_RATE_PER_KM = 1500;
export const BASE_RATE_PER_MIN = 200;

export const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  economy: 1,
  xl: 1.5,
  premium: 2.5,
};

export function calculateFare(
  distanceKm: number,
  durationMin: number,
  vehicleType: VehicleType,
): number {
  const base = distanceKm * BASE_RATE_PER_KM + durationMin * BASE_RATE_PER_MIN;
  return Math.round(base * VEHICLE_MULTIPLIERS[vehicleType]);
}

export function formatFare(fare: number): string {
  return `$${fare.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
