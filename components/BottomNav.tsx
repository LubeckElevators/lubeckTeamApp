import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomNavProps {
  active?: 'home' | 'explore' | 'dashboard';
}

export default function BottomNav({ active = 'home' }: BottomNavProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const tabs = [
    { key: 'home', label: 'Home', route: '/(tabs)/home' },
    { key: 'dashboard', label: 'Dashboard', route: '/(tabs)/index' },
    { key: 'explore', label: 'Explore', route: '/(tabs)/explore' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'dark'].card, borderColor: Colors[colorScheme ?? 'dark'].border }]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => router.replace(tab.route)}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
        >
          <Text style={{
            color: active === tab.key ? Colors[colorScheme ?? 'dark'].tint : Colors[colorScheme ?? 'dark'].icon,
            fontWeight: active === tab.key ? '700' as const : '500' as const,
          }}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
});
