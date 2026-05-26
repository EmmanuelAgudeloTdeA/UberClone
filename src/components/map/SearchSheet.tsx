import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import { fetchPlaceDetails, Prediction } from '@/services/placesService';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetTrip, setDestination, setOrigin, setTripStatus } from '@/store/tripSlice';
import { Coordinates } from '@/hooks/useLocation';
import VehicleSelector from '@/components/map/VehicleSelector';

const SHEET_COLLAPSED_HEIGHT = 88;
const SHEET_TRIP_HEIGHT = 420;
const SHEET_EXPANDED_HEIGHT = 520;
const ANIMATION_DURATION = 280;

interface SearchSheetProps {
  userCoords: Coordinates | null;
  bottomInset: number;
}

export default function SearchSheet({ userCoords, bottomInset }: SearchSheetProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const destination = useAppSelector((s) => s.trip.destination);
  const distanceKm = useAppSelector((s) => s.trip.distanceKm);
  const durationMin = useAppSelector((s) => s.trip.durationMin);
  const selectedVehicle = useAppSelector((s) => s.trip.selectedVehicle);
  const origin = useAppSelector((s) => s.trip.origin);
  const estimatedFare = useAppSelector((s) => s.trip.estimatedFare);

  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const sheetHeight = useSharedValue(SHEET_COLLAPSED_HEIGHT);

  const { query, predictions, loading, error, search, clear } = usePlacesSearch(userCoords);

  useLayoutEffect(() => {
    let target = SHEET_COLLAPSED_HEIGHT;
    if (isExpanded) target = SHEET_EXPANDED_HEIGHT;
    else if (destination) target = SHEET_TRIP_HEIGHT;
    sheetHeight.value = withTiming(target, { duration: ANIMATION_DURATION });
  }, [isExpanded, destination, sheetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const handleOpen = useCallback(() => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), ANIMATION_DURATION);
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setIsExpanded(false);
    clear();
  }, [clear]);

  const handleSelectPrediction = useCallback(
    async (prediction: Prediction) => {
      Keyboard.dismiss();
      setFetchingDetails(true);
      try {
        const details = await fetchPlaceDetails(prediction.placeId, prediction.description);
        dispatch(setDestination(details));
        if (userCoords) {
          dispatch(
            setOrigin({
              placeId: 'current-location',
              description: t('trip.currentLocation'),
              latitude: userCoords.latitude,
              longitude: userCoords.longitude,
            }),
          );
        }
        setIsExpanded(false);
        clear();
      } catch {
        // silently ignore — user can retry
      } finally {
        setFetchingDetails(false);
      }
    },
    [dispatch, userCoords, t, clear],
  );

  const handleClearDestination = useCallback(() => {
    dispatch(resetTrip());
  }, [dispatch]);

  const handleRequestRide = useCallback(() => {
    console.log('Ride requested:', { origin, destination, selectedVehicle, estimatedFare });
    dispatch(setTripStatus('finding_driver'));
  }, [origin, destination, selectedVehicle, estimatedFare, dispatch]);

  const listData = useMemo(() => predictions, [predictions]);

  const renderItem = useCallback(
    ({ item }: { item: Prediction }) => (
      <Pressable
        style={({ pressed }) => [styles.predictionRow, pressed && styles.predictionRowPressed]}
        onPress={() => handleSelectPrediction(item)}
        android_ripple={{ color: '#f0f0f0' }}
      >
        <View style={styles.pinIcon}>
          <Ionicons name="location-sharp" size={16} color="#555" />
        </View>
        <View style={styles.predictionTexts}>
          <Text style={styles.predictionMain} numberOfLines={1}>
            {item.mainText}
          </Text>
          {item.secondaryText ? (
            <Text style={styles.predictionSub} numberOfLines={1}>
              {item.secondaryText}
            </Text>
          ) : null}
        </View>
      </Pressable>
    ),
    [handleSelectPrediction],
  );

  return (
    <Animated.View style={[styles.sheet, animatedStyle, { paddingBottom: bottomInset + 8 }]}>
      <View style={styles.handle} />

      {isExpanded ? (
        <View style={styles.expandedContent}>
          <View style={styles.searchRow}>
            <Pressable onPress={handleClose} hitSlop={8} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#333" />
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={t('trip.searchPlaceholder')}
              placeholderTextColor="#999"
              value={query}
              onChangeText={search}
              returnKeyType="search"
              autoCorrect={false}
            />
            {(query.length > 0 || loading) && (
              <Pressable onPress={clear} hitSlop={8} style={styles.clearBtn}>
                {loading || fetchingDetails ? (
                  <ActivityIndicator size="small" color="#999" />
                ) : (
                  <Ionicons name="close" size={16} color="#888" />
                )}
              </Pressable>
            )}
          </View>

          {error ? (
            <View style={styles.statusRow}>
              <Text style={styles.errorText}>{t('trip.searchError')}</Text>
            </View>
          ) : null}

          {!loading && query.length > 0 && predictions.length === 0 && !error ? (
            <View style={styles.statusRow}>
              <Text style={styles.emptyText}>{t('trip.noResults')}</Text>
            </View>
          ) : null}

          <FlatList
            data={listData}
            keyExtractor={(item) => item.placeId}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : destination ? (
        <View>
          <View style={styles.destinationRow}>
            <View style={styles.destTexts}>
              <Text style={styles.destLabel}>{t('trip.destination')}</Text>
              <Text style={styles.destName} numberOfLines={1}>
                {destination.description}
              </Text>
            </View>
            <Pressable onPress={handleClearDestination} hitSlop={8} style={styles.clearDestBtn}>
              <Ionicons name="close" size={16} color="#666" />
            </Pressable>
          </View>
          {distanceKm !== null && durationMin !== null ? (
            <View style={styles.tripInfoRow}>
              <Text style={styles.tripInfoText}>
                {t('trip.tripInfo', {
                  dist: distanceKm.toFixed(1),
                  dur: durationMin,
                })}
              </Text>
            </View>
          ) : null}
          <VehicleSelector />
          <Pressable
            style={[styles.requestBtn, !selectedVehicle && styles.requestBtnDisabled]}
            onPress={handleRequestRide}
            disabled={!selectedVehicle}
            android_ripple={{ color: '#333' }}
          >
            <Text style={styles.requestBtnText}>{t('trip.requestRide')}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.whereToRow}
          onPress={handleOpen}
          android_ripple={{ color: '#eee' }}
        >
          <Ionicons name="search" size={18} color="#999" />
          <Text style={styles.whereToText}>{t('trip.whereTo')}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
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
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 14,
  },
  whereToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
    marginBottom: 8,
  },
  whereToText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  destTexts: {
    flex: 1,
  },
  destLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  destName: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  clearDestBtn: {
    padding: 4,
  },
  expandedContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    paddingVertical: 14,
  },
  clearBtn: {
    padding: 4,
    width: 28,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    gap: 14,
  },
  predictionRowPressed: {
    backgroundColor: '#f8f8f8',
  },
  pinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictionTexts: {
    flex: 1,
  },
  predictionMain: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  predictionSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  statusRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tripInfoRow: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    marginBottom: 4,
  },
  tripInfoText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  requestBtn: {
    marginTop: 14,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  requestBtnDisabled: {
    backgroundColor: '#ccc',
  },
  requestBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
