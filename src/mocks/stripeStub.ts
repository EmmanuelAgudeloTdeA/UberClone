import type { ReactNode } from 'react';

// Stub used when @stripe/stripe-react-native native module is unavailable (Expo Go).
// Payments show an informative error instead of crashing the bundler.

interface StripeProviderProps {
  publishableKey?: string;
  urlScheme?: string;
  merchantIdentifier?: string;
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps): ReactNode {
  return children;
}

export async function initPaymentSheet(
  _params: Record<string, unknown>,
): Promise<{ error?: { code: string; message: string; localizedMessage?: string } }> {
  return { error: { code: 'Failed', message: 'Stripe requires a custom dev build (not Expo Go).' } };
}

export async function presentPaymentSheet(): Promise<{
  error?: { code: string; message: string };
}> {
  return { error: { code: 'Failed', message: 'Stripe requires a custom dev build (not Expo Go).' } };
}
