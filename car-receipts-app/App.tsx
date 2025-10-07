import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './app/HomeScreen';
import NewReceiptScreen from './app/NewReceiptScreen';
import HistoryScreen from './app/HistoryScreen';
import SettingsScreen from './app/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  NewReceipt: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Car Shipping Receipts' }} />
        <Stack.Screen name="NewReceipt" component={NewReceiptScreen} options={{ title: 'New Receipt' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Receipt History' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}