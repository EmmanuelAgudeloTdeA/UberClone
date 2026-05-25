import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

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

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        setError('Location permission denied. Enable it in your device settings.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get your location.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { coords, loading, error, permissionGranted, refresh: fetchLocation };
}
