import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchPlacePredictions, Prediction } from '@/services/placesService';
import { Coordinates } from '@/hooks/useLocation';

const DEBOUNCE_MS = 400;

interface UsePlacesSearchResult {
  query: string;
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  search: (text: string) => void;
  clear: () => void;
}

export function usePlacesSearch(locationBias?: Coordinates | null): UsePlacesSearchResult {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const search = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text.trim()) {
        setPredictions([]);
        setError(null);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const bias = locationBias ?? undefined;
          const results = await fetchPlacePredictions(text, bias);
          setPredictions(results);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Search failed');
          setPredictions([]);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [locationBias],
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    setPredictions([]);
    setError(null);
    setLoading(false);
  }, []);

  return { query, predictions, loading, error, search, clear };
}
