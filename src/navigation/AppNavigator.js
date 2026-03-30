import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, Platform } from 'react-native';

import Dashboard from '../screens/Dashboard';
import MapScreen from '../screens/MapScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Mapa') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Histórico') iconName = focused ? 'time' : 'time-outline';
          return <Ionicons name={iconName} size={isTablet ? 26 : size} color={color} />;
        },
        tabBarActiveTintColor: '#1A5C38',
        tabBarInactiveTintColor: '#888',
        tabBarLabelPosition: isTablet ? 'beside-icon' : 'below-icon',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? (isTablet ? 70 : 85) : (isTablet ? 70 : 60),
          paddingBottom: Platform.OS === 'ios' ? (isTablet ? 0 : 24) : (isTablet ? 0 : 8),
          paddingHorizontal: isTablet ? 40 : 0,
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 15 : 11,
          fontWeight: '700',
          marginLeft: isTablet ? 8 : 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Histórico" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
