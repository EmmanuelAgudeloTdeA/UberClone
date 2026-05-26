import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import TripCard from '@/components/TripCard';
import { fetchTripHistory, TripRecord } from '@/services/tripService';

export default function TripsTab() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchTripHistory();
      setTrips(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color="#555" />
        <Text style={styles.emptyTitle}>{t('profile.tripsError')}</Text>
        <Pressable style={styles.retryBtn} onPress={loadTrips} hitSlop={8}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="car-outline" size={52} color="#555" />
        <Text style={styles.emptyTitle}>{t('profile.noTrips')}</Text>
        <Text style={styles.emptySubtitle}>{t('profile.tripsEmptySubtitle')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => <TripCard trip={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
});
