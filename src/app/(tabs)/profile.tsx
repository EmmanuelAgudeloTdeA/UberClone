import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Profile</ThemedText>
      <ThemedText type="small">Phase 1.3 — Profile screen coming soon</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
