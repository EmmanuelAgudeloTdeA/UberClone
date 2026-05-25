import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';
import { fetchUserProfile } from '@/services/profileService';
import { useAppDispatch, useAppSelector } from '@/store';
import { setProfile, setProfileLoading } from '@/store/profileSlice';
import PersonalDataTab from '@/screens/profile/PersonalDataTab';
import SecurityTab from '@/screens/profile/SecurityTab';
import TripsTab from '@/screens/profile/TripsTab';

type TabKey = 'personal' | 'security' | 'trips';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = useAppSelector(state => state.profile.data);
  const isLoading = useAppSelector(state => state.profile.loading);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  const loadProfile = useCallback(async () => {
    if (!user) return;
    dispatch(setProfileLoading(true));
    try {
      const data = await fetchUserProfile(user.uid);
      dispatch(setProfile(data));
    } catch {
      dispatch(setProfile(null));
    }
  }, [user, dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'personal', label: t('profile.personalData') },
    { key: 'security', label: t('profile.security') },
    { key: 'trips', label: t('profile.myTrips') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        {profile?.fullName ? <Text style={styles.name}>{profile.fullName}</Text> : null}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {isLoading && !profile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === 'personal' && <PersonalDataTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'trips' && <TripsTab />}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 15,
    color: '#888',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginHorizontal: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#fff',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});
