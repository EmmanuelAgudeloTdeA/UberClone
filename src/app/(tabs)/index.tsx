import { useState, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/services/authService';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await logoutUser();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [t]);

  return (
    <View style={styles.container}>
      <ThemedText type="title">{t('home.greeting')}</ThemedText>
      {user?.email ? (
        <ThemedText type="small">{user.email}</ThemedText>
      ) : null}
      <ThemedText type="small">Phase 1.3 — Ride booking coming soon</ThemedText>
      <Button
        title={t('auth.logout')}
        variant="ghost"
        loading={loading}
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  logoutBtn: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});
