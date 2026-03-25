import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NetworkProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </NetworkProvider>
  );
}
