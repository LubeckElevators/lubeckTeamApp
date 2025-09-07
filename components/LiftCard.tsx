import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Lift {
  id: string;
  name?: string;
  model?: string;
  status?: string;
  location?: string;
}

export default function LiftCard({ lift }: { lift: Lift }) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'dark'].card, borderColor: Colors[colorScheme ?? 'dark'].border }] }>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'dark'].text }]}>
        {lift.name || `Lift ${lift.id}`}
      </Text>
      <Text style={[styles.meta, { color: Colors[colorScheme ?? 'dark'].icon }]}>
        {lift.model ? `Model: ${lift.model}` : 'Model: —'}
      </Text>
      <Text style={[styles.meta, { color: Colors[colorScheme ?? 'dark'].icon }]}>
        {lift.status ? `Status: ${lift.status}` : 'Status: —'}
      </Text>
      <Text style={[styles.meta, { color: Colors[colorScheme ?? 'dark'].icon }]}>
        {lift.location ? `Location: ${lift.location}` : 'Location: —'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    marginBottom: 2,
  },
});
