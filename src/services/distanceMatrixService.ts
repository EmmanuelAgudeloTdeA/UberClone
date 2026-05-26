const BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export interface DistanceMatrixResult {
  distanceKm: number;
  durationMin: number;
}

export async function fetchDistanceMatrix(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<DistanceMatrixResult> {
  const params = new URLSearchParams({
    origins: `${origin.latitude},${origin.longitude}`,
    destinations: `${destination.latitude},${destination.longitude}`,
    key: API_KEY,
    language: 'es',
    mode: 'driving',
    units: 'metric',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    rows?: Array<{
      elements: Array<{
        status: string;
        distance: { value: number };
        duration: { value: number };
      }>;
    }>;
  };

  if (data.status !== 'OK') {
    throw new Error(data.error_message ?? `Distance Matrix error: ${data.status}`);
  }

  const element = data.rows![0].elements[0];
  if (element.status !== 'OK') {
    throw new Error(`Route not found: ${element.status}`);
  }

  return {
    distanceKm: element.distance.value / 1000,
    durationMin: Math.ceil(element.duration.value / 60),
  };
}
