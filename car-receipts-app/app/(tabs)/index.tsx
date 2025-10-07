import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Car Shipping Receipts</Text>
      <View style={styles.buttonContainer}>
        <Link href="/(tabs)/two" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>New Receipt</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/HistoryScreen" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Receipt History</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/SettingsScreen" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});