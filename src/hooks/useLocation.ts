import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseLocationResult {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  refresh: () => void;
}

export function useLocation(): UseLocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startWatching = useCallback(async () => {
    setLoading(true);
    setError(null);

    subscriptionRef.current?.remove();
    subscriptionRef.current = null;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        setError('Location permission denied. Enable it in your device settings.');
        setLoading(false);
        return;
      }

      // Show last known position immediately while GPS warms up
      const last = await Location.getLastKnownPositionAsync({ maxAge: 60_000 });
      if (last) {
        setCoords({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          accuracy: last.coords.accuracy ?? undefined,
        });
        setLoading(false);
      }

      // Watch for live updates — Balanced uses WiFi/cell (works indoors)
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
          timeInterval: 5000,
        },
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
          });
          setLoading(false);
          setError(null);
        },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get your location.';
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startWatching();
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [startWatching]);

  return { coords, loading, error, permissionGranted, refresh: startWatching };
}
