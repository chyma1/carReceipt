import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import NewReceiptScreen from './screens/NewReceiptScreen';
import HistoryScreen from './screens/HistoryScreen';

export type RootStackParamList = {
  Home: undefined;
  NewReceipt: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CarShip Receipts' }} />
        <Stack.Screen name="NewReceipt" component={NewReceiptScreen} options={{ title: 'New Receipt' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Receipt History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}