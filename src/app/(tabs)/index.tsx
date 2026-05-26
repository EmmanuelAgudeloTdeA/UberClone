import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UserMarker from '@/components/map/UserMarker';
import { MAP_STYLE } from '@/constants/mapStyle';
import { useLocation } from '@/hooks/useLocation';

// Google Maps on Android, default (Apple Maps) on iOS for Expo Go compatibility.
// Switch both to PROVIDER_GOOGLE when using a custom development build with an iOS API key.
const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

const DEFAULT_REGION = {
  latitude: 6.2442, // Medellín, Colombia
  longitude: -75.5812,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const USER_DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 };

export default function HomeScreen() {
  const { coords, loading, error, refresh } = useLocation();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  // Smooth animate to user's position once location is available
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, ...USER_DELTA },
      1000,
    );
  }, [coords]);

  const handleCenterOnUser = useCallback(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, ...USER_DELTA },
      600,
    );
  }, [coords]);

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={MAP_PROVIDER}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={MAP_STYLE}
        mapPadding={{ top: insets.top, right: 0, bottom: 0, left: 0 }}
      >
        {coords && (
          <Marker
            coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            tracksViewChanges={false}
          >
            <UserMarker />
          </Marker>
        )}
      </MapView>

      {/* Location loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Getting your location…</Text>
        </View>
      )}

      {/* Permission / location error */}
      {error && !loading && (
        <View style={[styles.errorCard, { top: insets.top + 16 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={refresh} hitSlop={8}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Center-on-me FAB */}
      {coords && (
        <Pressable
          style={[styles.myLocationFab, { bottom: 100 + insets.bottom }]}
          onPress={handleCenterOnUser}
          android_ripple={{ color: '#eee', radius: 24 }}
        >
          <Text style={styles.fabIcon}>⦿</Text>
        </Pressable>
      )}

      {/* "Where to?" bottom sheet — populated in Phase 2.2 */}
      <View style={[styles.searchSheet, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.sheetHandle} />
        <Pressable style={styles.searchRow} android_ripple={{ color: '#eee' }}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Where to?</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  myLocationFab: {
    position: 'absolute',
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 22,
    color: '#000',
  },
  searchSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
    marginBottom: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
