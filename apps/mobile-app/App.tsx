import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Placeholder until the screens in design/Skywash App.dc.html are built.
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skywash</Text>
      <Text style={styles.subtitle}>Car wash booking — coming soon</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#E0F2FE', fontSize: 15 },
});
