import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack initialRouteName="sites">
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sites"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="complaints"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="complaint-detail"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
