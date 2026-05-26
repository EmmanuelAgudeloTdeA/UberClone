import { useEffect } from 'react';

import { fetchDistanceMatrix } from '@/services/distanceMatrixService';
import { useAppDispatch } from '@/store';
import { PlaceResult, setDistanceKm, setDurationMin } from '@/store/tripSlice';

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
      .catch(() => {
        // silently ignore — fares show as unavailable until data arrives
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, dispatch]);
}
