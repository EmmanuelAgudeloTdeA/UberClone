import '@/i18n';
import '@/services/firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useRouter, useSegments, Stack } from 'expo-router';
import i18n from 'i18next';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { store } from '@/store';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';
    const inTabsGroup = (segments[0] as string) === '(tabs)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

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
