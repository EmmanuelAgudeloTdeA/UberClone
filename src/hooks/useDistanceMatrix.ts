import { useEffect } from 'react';

import { fetchDistanceMatrix } from '@/services/distanceMatrixService';
import logger from '@/utils/logger';
import { useAppDispatch } from '@/store';
import { PlaceResult, setDistanceKm, setDurationMin } from '@/store/tripSlice';

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function useDistanceMatrix(
  origin: PlaceResult | null,
  destination: PlaceResult | null,
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!origin || !destination) {
      dispatch(setDistanceKm(null));
      dispatch(setDurationMin(null));
      return;
    }

    let cancelled = false;

    fetchDistanceMatrix(origin, destination)
      .then(({ distanceKm, durationMin }) => {
        if (cancelled) return;
        dispatch(setDistanceKm(distanceKm));
        dispatch(setDurationMin(durationMin));
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn('Distance Matrix API failed, using Haversine fallback:', err?.message);

        // Fallback: straight-line distance × 1.4 road factor, avg speed 25 km/h
        const straight = haversineKm(origin, destination);
        const roadKm = Math.round(straight * 1.4 * 10) / 10;
        const durationMin = Math.max(1, Math.ceil((roadKm / 25) * 60));
        dispatch(setDistanceKm(roadKm));
        dispatch(setDurationMin(durationMin));
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, dispatch]);
}
