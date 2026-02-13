import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './app/screens/HomeScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1A1A1A', borderTopColor: '#2A2A2A' },
          tabBarActiveTintColor: '#14F195',
          tabBarInactiveTintColor: '#666666',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            tabBarLabel: 'Challenges',
            tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>🏆</span>
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ 
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => <span style={{ fontSize: 20 }}>👤</span>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
