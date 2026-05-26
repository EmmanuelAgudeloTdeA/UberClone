import { View, StyleSheet } from 'react-native';

export default function DestinationMarker() {
  return (
    <View style={styles.container}>
      <View style={styles.head} />
      <View style={styles.stem} />
      <View style={styles.base} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  head: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
  },
  stem: {
    width: 3,
    height: 12,
    backgroundColor: '#000',
  },
  base: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});
