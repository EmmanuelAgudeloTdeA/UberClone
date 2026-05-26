import * as WebBrowser from 'expo-web-browser';

const BACKEND_URL = process.env.EXPO_PUBLIC_MERCADOPAGO_BACKEND_URL ?? '';
const SUCCESS_REDIRECT = 'uberclone://payment-success';

export async function openMercadoPagoCheckout(amountCOP: number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/create-preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountCOP, currency: 'COP' }),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);

  const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };

  const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, SUCCESS_REDIRECT);

  if (result.type !== 'success') {
    throw new Error('MercadoPago payment was cancelled or failed');
  }
}
