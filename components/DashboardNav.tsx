import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DashboardNavActive = 'sites' | 'complaints' | 'sales';

interface DashboardNavProps {
  active: DashboardNavActive;
}

export default function DashboardNav({ active }: DashboardNavProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const styles = createStyles(colorScheme);
  const bottomPadding = Math.max(insets.bottom - 1, 0);

  // Slide-in + fade-in animation for the whole bar
  const appear = useSharedValue(0);
  useEffect(() => {
    appear.value = withTiming(1, { duration: 300 });
  }, [appear]);
  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ translateY: (1 - appear.value) * 20 }],
  }));

  const handlePress = (target: DashboardNavActive) => {
    if (target === 'sites') {
      router.replace('/(tabs)/sites');
    } else if (target === 'complaints') {
      router.replace('/(tabs)/complaints');
    } else if (target === 'sales') {
      router.replace('/(tabs)/sales');
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { paddingBottom: bottomPadding }, wrapperAnimatedStyle]}>
      <View style={styles.container}>
        <NavItem
          label="Sites"
          iconName="business"
          active={active === 'sites'}
          onPress={() => handlePress('sites')}
          colorScheme={colorScheme}
        />
        <NavItem
          label="Complaints"
          iconName="document-text"
          active={active === 'complaints'}
          onPress={() => handlePress('complaints')}
          colorScheme={colorScheme}
        />
        <NavItem
          label="Sales"
          iconName="cash"
          active={active === 'sales'}
          onPress={() => handlePress('sales')}
          colorScheme={colorScheme}
        />
      </View>
    </Animated.View>
  );
}

function NavItem({
  label,
  iconName,
  active,
  onPress,
  colorScheme,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  colorScheme: 'light' | 'dark';
}) {
  const styles = createStyles(colorScheme);

  // Animate active background and scale; also scale on press
  const activeValue = useSharedValue(active ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    activeValue.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, activeValue]);

  const animatedItemStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value * (1 + activeValue.value * 0.04) }],
      backgroundColor: interpolateColor(
        activeValue.value,
        [0, 1],
        ['rgba(0,0,0,0)', Colors[colorScheme].tint]
      ),
    };
  });

  return (
    <Animated.View style={[styles.item, animatedItemStyle]}>
      <Pressable
        onPressIn={() => {
          pressScale.value = withTiming(0.96, { duration: 80 });
        }}
        onPressOut={() => {
          pressScale.value = withTiming(1, { duration: 120 });
        }}
        onPress={onPress}
        style={{ alignItems: 'center', paddingVertical: 10, borderRadius: 16 }}
        android_ripple={{ color: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5E5' }}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={active ? '#FFFFFF' : Colors[colorScheme].icon}
          style={{ marginBottom: 6 }}
        />
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors[colorScheme].card,
    borderWidth: 1,
    borderColor: Colors[colorScheme].border,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemLabel: {
    fontSize: 12,
    color: Colors[colorScheme].icon,
    fontWeight: '600',
  },
  itemLabelActive: {
    color: '#FFFFFF',
  },
});
