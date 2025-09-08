import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        // Hide the default tab bar
        tabBarButton: () => null,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            display: 'none',
            height: 0,
          },
          default: {
            backgroundColor: 'transparent',
            display: 'none',
            height: 0,
          },
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sites"
        options={{
          title: 'Sites',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="building.2.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
