import { useEffect, useRef } from 'react';

import { Coordinates } from '@/hooks/useLocation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setDriverPosition, setTripStatus } from '@/store/tripSlice';

const FIND_DELAY_MS = 3000;
const STEP_INTERVAL_MS = 1500;
const DRIVER_OFFSET_KM = 2;

const SIMULATION_STATUSES = new Set(['finding_driver', 'driver_en_route', 'arrived']);

export function useDriverSimulation(userCoords: Coordinates | null, steps: number = 12): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.trip.status);

  const coordsRef = useRef(userCoords);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    coordsRef.current = userCoords;
  }, [userCoords]);

  // Start simulation when status becomes 'finding_driver'
  useEffect(() => {
    if (status !== 'finding_driver' || !coordsRef.current) return;

    const origin = coordsRef.current;
    const latPerKm = 1 / 111;
    const lngPerKm = 1 / (111 * Math.cos((origin.latitude * Math.PI) / 180));

    const driverStart = {
      latitude: origin.latitude + DRIVER_OFFSET_KM * latPerKm,
      longitude: origin.longitude - DRIVER_OFFSET_KM * lngPerKm,
    };

    dispatch(setDriverPosition(driverStart));

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      dispatch(setTripStatus('driver_en_route'));

      const waypoints = Array.from({ length: steps }, (_, i) => {
        const t = (i + 1) / steps;
        return {
          latitude: driverStart.latitude + t * (origin.latitude - driverStart.latitude),
          longitude: driverStart.longitude + t * (origin.longitude - driverStart.longitude),
        };
      });

      let step = 0;
      intervalRef.current = setInterval(() => {
        if (step >= waypoints.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          dispatch(setTripStatus('arrived'));
          return;
        }
        dispatch(setDriverPosition(waypoints[step]));
        step += 1;
      }, STEP_INTERVAL_MS);
    }, FIND_DELAY_MS);

    // Only cancel the pending timeout on cleanup — the interval must outlive
    // the 'finding_driver' status so the driver keeps moving after dispatch.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Cancel the moving interval when the trip is reset externally (e.g. user cancels)
  useEffect(() => {
    if (!SIMULATION_STATUSES.has(status) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);
}
