import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store';
import { setEstimatedFare, setSelectedVehicle, VehicleType } from '@/store/tripSlice';
import { calculateFare, formatFare } from '@/utils/fareCalculation';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface VehicleOption {
  type: VehicleType;
  iconName: IoniconsName;
}

const VEHICLES: VehicleOption[] = [
  { type: 'economy', iconName: 'car-outline' },
  { type: 'xl', iconName: 'car' },
  { type: 'premium', iconName: 'car-sport-outline' },
];

const VEHICLE_NAME_KEYS: Record<VehicleType, 'trip.vehicleEconomy' | 'trip.vehicleXl' | 'trip.vehiclePremium'> = {
  economy: 'trip.vehicleEconomy',
  xl: 'trip.vehicleXl',
  premium: 'trip.vehiclePremium',
};

const VEHICLE_ETA_KEYS: Record<VehicleType, 'trip.vehicleEconomyEta' | 'trip.vehicleXlEta' | 'trip.vehiclePremiumEta'> = {
  economy: 'trip.vehicleEconomyEta',
  xl: 'trip.vehicleXlEta',
  premium: 'trip.vehiclePremiumEta',
};

export default function VehicleSelector() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.trip.selectedVehicle);
  const distanceKm = useAppSelector((s) => s.trip.distanceKm);
  const durationMin = useAppSelector((s) => s.trip.durationMin);

  const hasFareData = distanceKm !== null && durationMin !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trip.chooseRide')}</Text>
      <View style={styles.row}>
        {VEHICLES.map((v) => {
          const isSelected = selected === v.type;
          const fare = hasFareData
            ? formatFare(calculateFare(distanceKm!, durationMin!, v.type))
            : null;

          return (
            <Pressable
              key={v.type}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => {
                dispatch(setSelectedVehicle(v.type));
                if (hasFareData) {
                  dispatch(setEstimatedFare(calculateFare(distanceKm!, durationMin!, v.type)));
                }
              }}
              android_ripple={{ color: '#555', radius: 60 }}
            >
              <Ionicons name={v.iconName} size={28} color={isSelected ? '#fff' : '#111'} />
              <Text style={[styles.name, isSelected && styles.textLight]}>
                {t(VEHICLE_NAME_KEYS[v.type])}
              </Text>
              {fare ? (
                <Text style={[styles.fare, isSelected && styles.textLight]}>{fare}</Text>
              ) : null}
              <Text style={[styles.eta, isSelected && styles.etaSelected]}>
                {t(VEHICLE_ETA_KEYS[v.type])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    gap: 3,
  },
  cardSelected: {
    backgroundColor: '#111',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  textLight: {
    color: '#fff',
  },
  fare: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  eta: {
    fontSize: 11,
    color: '#888',
  },
  etaSelected: {
    color: '#aaa',
  },
});
