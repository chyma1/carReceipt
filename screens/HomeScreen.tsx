import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarShip Receipts</Text>
      <Text style={styles.subtitle}>Generate sleek PDF receipts for car shipping.</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('NewReceipt')}>
        <Text style={styles.buttonText}>New Receipt</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('History')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Receipt History</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: '#e2e8f0' },
  secondaryText: { color: '#0f172a' },
});
