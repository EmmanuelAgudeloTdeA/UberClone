import '@/i18n';
import '@/services/firebase';

import { useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
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

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </Provider>
  );
}
