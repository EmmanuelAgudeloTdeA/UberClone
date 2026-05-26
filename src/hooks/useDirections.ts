import { useEffect } from 'react';

import { fetchDirections } from '@/services/directionsService';
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
      .catch(() => {
        if (!cancelled) dispatch(setRoutePoints(null));
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, dispatch]);
}
