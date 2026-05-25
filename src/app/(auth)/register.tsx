import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Register</ThemedText>
      <ThemedText type="small">Phase 1.2 — Auth coming soon</ThemedText>
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
