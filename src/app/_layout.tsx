import '@/i18n';
import '@/services/firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useRouter, useSegments, Stack } from 'expo-router';
import i18n from 'i18next';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { store } from '@/store';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    if (loading) return;

    const seg = segments[0] as string;
    const inAuthGroup = seg === '(auth)';
    const inTabsGroup = seg === '(tabs)';
    const onPayment = seg === 'payment';

    if (!user && !inAuthGroup) {
      routerRef.current.replace('/(auth)/login');
    } else if (user && !inTabsGroup && !onPayment) {
      routerRef.current.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    AsyncStorage.getItem('lang').then((lang) => {
      if (lang) i18n.changeLanguage(lang);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
        <Provider store={store}>
          <AuthProvider>
            <AuthGuard />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="payment"
                options={{ headerShown: true, title: 'Pagar viaje', headerBackTitle: '' }}
              />
            </Stack>
          </AuthProvider>
        </Provider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
