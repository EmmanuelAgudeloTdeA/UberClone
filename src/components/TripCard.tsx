import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { TripRecord } from '@/services/tripService';
import { formatFare } from '@/utils/fareCalculation';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const VEHICLE_ICONS: Record<TripRecord['vehicleType'], IoniconsName> = {
  economy: 'car-outline',
  xl: 'car',
  premium: 'car-sport-outline',
};

interface Props {
  trip: TripRecord;
}

function formatDate(ts: TripRecord['date']): string {
  const d = ts.toDate();
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TripCard({ trip }: Props) {
  const { t } = useTranslation();
  const iconName = VEHICLE_ICONS[trip.vehicleType];
  const vehicleLabel = t(`profile.vehicle${trip.vehicleType.charAt(0).toUpperCase()}${trip.vehicleType.slice(1)}` as never);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.vehicleBadge}>
          <Ionicons name={iconName} size={18} color="#fff" />
        </View>
        <Text style={styles.vehicleLabel}>{vehicleLabel}</Text>
        <Text style={styles.date}>{formatDate(trip.date)}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeRow}>
          <Ionicons name="ellipse" size={8} color="#4285F4" />
          <Text style={styles.routeText} numberOfLines={1}>{trip.origin.description}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <Ionicons name="location-sharp" size={12} color="#ef4444" />
          <Text style={styles.routeText} numberOfLines={1}>{trip.destination.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.fareLabel}>{t('profile.tripFare')}</Text>
        <Text style={styles.fareAmount}>{formatFare(trip.fare)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  route: {
    gap: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLine: {
    width: 1,
    height: 10,
    backgroundColor: '#333',
    marginLeft: 4,
  },
  routeText: {
    flex: 1,
    fontSize: 13,
    color: '#ddd',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 10,
  },
  fareLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  fareAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
