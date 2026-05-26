import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

const BACKEND_URL = (process.env.EXPO_PUBLIC_STRIPE_BACKEND_URL ?? '').replace(/\/$/, '');

export async function initStripePayment(amountCOP: number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountCOP, currency: 'cop' }),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);

  const { paymentIntent, ephemeralKey, customer } = (await res.json()) as {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  };

  const { error: initError } = await initPaymentSheet({
    merchantDisplayName: 'UberClone',
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    paymentIntentClientSecret: paymentIntent,
    allowsDelayedPaymentMethods: false,
    returnURL: 'uberclone://stripe-return',
  });

  if (initError) throw new Error(initError.message);
}

export async function presentStripePayment(): Promise<void> {
  const { error } = await presentPaymentSheet();
  if (error) throw new Error(error.message);
}
