import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedVehicle, VehicleType } from '@/store/tripSlice';

interface VehicleOption {
  type: VehicleType;
  icon: string;
  name: string;
  eta: string;
}

const VEHICLES: VehicleOption[] = [
  { type: 'economy', icon: '🚗', name: 'Economy', eta: '~5 min' },
  { type: 'xl', icon: '🚙', name: 'XL', eta: '~8 min' },
  { type: 'premium', icon: '🚘', name: 'Premium', eta: '~10 min' },
];

export default function VehicleSelector() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.trip.selectedVehicle);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trip.chooseRide')}</Text>
      <View style={styles.row}>
        {VEHICLES.map((v) => {
          const isSelected = selected === v.type;
          return (
            <Pressable
              key={v.type}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => dispatch(setSelectedVehicle(v.type))}
              android_ripple={{ color: '#555', radius: 60 }}
            >
              <Text style={styles.icon}>{v.icon}</Text>
              <Text style={[styles.name, isSelected && styles.textLight]}>{v.name}</Text>
              <Text style={[styles.eta, isSelected && styles.etaSelected]}>{v.eta}</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  cardSelected: {
    backgroundColor: '#111',
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  textLight: {
    color: '#fff',
  },
  eta: {
    fontSize: 12,
    color: '#888',
  },
  etaSelected: {
    color: '#aaa',
  },
});
