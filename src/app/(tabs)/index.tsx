import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DestinationMarker from '@/components/map/DestinationMarker';
import SearchSheet from '@/components/map/SearchSheet';
import UserMarker from '@/components/map/UserMarker';
import { MAP_STYLE } from '@/constants/mapStyle';
import { useDirections } from '@/hooks/useDirections';
import { useLocation } from '@/hooks/useLocation';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetTrip } from '@/store/tripSlice';

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
const ROUTE_DELTA = { latitudeDelta: 0.04, longitudeDelta: 0.04 };

export default function HomeScreen() {
  const { coords, loading, error, refresh } = useLocation();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const origin = useAppSelector((s) => s.trip.origin);
  const destination = useAppSelector((s) => s.trip.destination);
  const routePoints = useAppSelector((s) => s.trip.routePoints);

  useDirections(origin, destination);

  // Smooth animate to user's position once location is available
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, ...USER_DELTA },
      1000,
    );
  }, [coords]);

  // Fit map to show both origin and destination when destination is set
  useEffect(() => {
    if (!coords || !destination || !mapRef.current) return;
    const midLat = (coords.latitude + destination.latitude) / 2;
    const midLng = (coords.longitude + destination.longitude) / 2;
    const latDelta = Math.abs(coords.latitude - destination.latitude) * 2.2;
    const lngDelta = Math.abs(coords.longitude - destination.longitude) * 2.2;
    mapRef.current.animateToRegion(
      {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, ROUTE_DELTA.latitudeDelta),
        longitudeDelta: Math.max(lngDelta, ROUTE_DELTA.longitudeDelta),
      },
      800,
    );
  }, [coords, destination]);

  const handleCenterOnUser = useCallback(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, ...USER_DELTA },
      600,
    );
  }, [coords]);

  const fabBottom = useMemo(() => 100 + insets.bottom, [insets.bottom]);

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

        {routePoints && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#4285F4"
            strokeWidth={4}
          />
        )}

        {destination && (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <DestinationMarker />
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

      {/* Center-on-me FAB — hidden when destination is shown to avoid overlap */}
      {coords && !destination && (
        <Pressable
          style={[styles.myLocationFab, { bottom: fabBottom }]}
          onPress={handleCenterOnUser}
          android_ripple={{ color: '#eee', radius: 24 }}
        >
          <Text style={styles.fabIcon}>⦿</Text>
        </Pressable>
      )}

      {/* Recenter FAB — shown when a destination is active */}
      {coords && destination && (
        <Pressable
          style={[styles.myLocationFab, { bottom: fabBottom }]}
          onPress={() => dispatch(resetTrip())}
          android_ripple={{ color: '#eee', radius: 24 }}
        >
          <Text style={styles.fabIcon}>✕</Text>
        </Pressable>
      )}

      {/* Destination search bottom sheet */}
      <SearchSheet userCoords={coords} bottomInset={insets.bottom} />
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
});
