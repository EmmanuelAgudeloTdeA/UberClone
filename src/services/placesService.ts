const BASE_URL = 'https://maps.googleapis.com/maps/api';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

export interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface LocationBias {
  latitude: number;
  longitude: number;
}

export async function fetchPlacePredictions(
  input: string,
  locationBias?: LocationBias,
): Promise<Prediction[]> {
  const params = new URLSearchParams({
    input,
    key: API_KEY,
    language: 'es',
    components: 'country:co',
  });

  if (locationBias) {
    params.append('location', `${locationBias.latitude},${locationBias.longitude}`);
    params.append('radius', '50000');
  }

  const res = await fetch(`${BASE_URL}/place/autocomplete/json?${params}`);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    predictions?: Array<{
      place_id: string;
      description: string;
      structured_formatting?: { main_text: string; secondary_text: string };
    }>;
  };

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message ?? `Places API error: ${data.status}`);
  }

  return (data.predictions ?? []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting?.main_text ?? p.description,
    secondaryText: p.structured_formatting?.secondary_text ?? '',
  }));
}

export async function fetchPlaceDetails(
  placeId: string,
  description: string,
): Promise<PlaceDetails> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'geometry',
    key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/place/details/json?${params}`);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    result?: { geometry: { location: { lat: number; lng: number } } };
  };

  if (data.status !== 'OK') {
    throw new Error(data.error_message ?? `Places Details error: ${data.status}`);
  }

  const { lat, lng } = data.result!.geometry.location;
  return { placeId, description, latitude: lat, longitude: lng };
}
