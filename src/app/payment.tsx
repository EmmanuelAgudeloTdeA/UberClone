import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store';
import { resetTrip } from '@/store/tripSlice';
import { initStripePayment, presentStripePayment } from '@/services/stripeService';
import { openMercadoPagoCheckout } from '@/services/mercadopagoService';
import { saveCompletedTripForCurrentUser } from '@/services/tripService';
import { formatFare } from '@/utils/fareCalculation';

type PaymentMethod = 'stripe' | 'mercadopago';

export default function PaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const origin = useAppSelector((s) => s.trip.origin);
  const destination = useAppSelector((s) => s.trip.destination);
  const estimatedFare = useAppSelector((s) => s.trip.estimatedFare);
  const selectedVehicle = useAppSelector((s) => s.trip.selectedVehicle);

  const [processing, setProcessing] = useState<PaymentMethod | null>(null);

  const handlePayment = useCallback(
    async (method: PaymentMethod) => {
      if (!origin || !destination || !selectedVehicle) return;

      setProcessing(method);
      try {
        const stripeBackend = process.env.EXPO_PUBLIC_STRIPE_BACKEND_URL ?? '';
        const mpBackend = process.env.EXPO_PUBLIC_MERCADOPAGO_BACKEND_URL ?? '';
        const hasBackend = method === 'stripe' ? stripeBackend.length > 0 : mpBackend.length > 0;

        if (hasBackend) {
          if (method === 'stripe') {
            await initStripePayment(estimatedFare ?? 0);
            await presentStripePayment();
          } else {
            await openMercadoPagoCheckout(estimatedFare ?? 0);
          }
        }

        await saveCompletedTripForCurrentUser({
          origin,
          destination,
          fare: estimatedFare ?? 0,
          vehicleType: selectedVehicle,
          paymentMethod: method,
        });

        dispatch(resetTrip());
        router.replace('/(tabs)');
      } catch (err) {
        Alert.alert(
          t('payment.errorTitle'),
          err instanceof Error ? err.message : String(err),
        );
      } finally {
        setProcessing(null);
      }
    },
    [origin, destination, estimatedFare, selectedVehicle, dispatch, router, t],
  );

  const vehicleLabel = selectedVehicle
    ? selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)
    : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Trip summary card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('payment.title')}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>{t('payment.from')}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {origin?.description ?? '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>{t('payment.to')}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {destination?.description ?? '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>{t('payment.vehicle')}</Text>
          <Text style={styles.value}>{vehicleLabel}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('payment.total')}</Text>
          <Text style={styles.totalAmount}>
            {estimatedFare !== null ? formatFare(estimatedFare) : '—'}
          </Text>
        </View>
      </View>

      {/* Payment method section */}
      <Text style={styles.methodTitle}>{t('payment.chooseMethod')}</Text>

      <Pressable
        style={[styles.payBtn, styles.payBtnStripe, processing !== null && styles.payBtnDisabled]}
        onPress={() => handlePayment('stripe')}
        disabled={processing !== null}
        android_ripple={{ color: '#333' }}
      >
        {processing === 'stripe' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>{t('payment.payStripe')}</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.payBtn, styles.payBtnMP, processing !== null && styles.payBtnDisabled]}
        onPress={() => handlePayment('mercadopago')}
        disabled={processing !== null}
        android_ripple={{ color: '#007abb' }}
      >
        {processing === 'mercadopago' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>{t('payment.payMercadoPago')}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    minWidth: 60,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  payBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  payBtnStripe: {
    backgroundColor: '#635BFF',
  },
  payBtnMP: {
    backgroundColor: '#009EE3',
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
