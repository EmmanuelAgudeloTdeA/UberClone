import { useEffect } from 'react';

import { fetchDirections } from '@/services/directionsService';
import logger from '@/utils/logger';
import { useAppDispatch } from '@/store';
import { PlaceResult, setRoutePoints } from '@/store/tripSlice';

export function useDirections(
  origin: PlaceResult | null,
  destination: PlaceResult | null,
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!origin || !destination) {
      dispatch(setRoutePoints(null));
      return;
    }

    let cancelled = false;

    fetchDirections(origin, destination)
      .then((points) => {
        if (!cancelled) dispatch(setRoutePoints(points));
      })
      .catch((err) => {
        if (cancelled) return;
        logger.warn('Directions API failed, no route drawn:', err?.message);
        dispatch(setRoutePoints(null));
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, dispatch]);
}
