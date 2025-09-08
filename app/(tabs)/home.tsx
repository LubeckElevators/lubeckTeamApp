import BottomNav from '@/components/BottomNav';
import LiftCard from '@/components/LiftCard';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { userProfile } = useUser();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mock lifts data (design only)
  const lifts = useMemo(() => (
    [
      { id: 'L-1001', name: 'Tower A - Lift 1', model: 'LX-400', status: 'Online', location: 'Block A' },
      { id: 'L-1002', name: 'Tower A - Lift 2', model: 'LX-400', status: 'Maintenance', location: 'Block A' },
      { id: 'L-2042', name: 'Service Lift', model: 'SRV-200', status: 'Online', location: 'Back Bay' },
      { id: 'L-3421', name: 'Panoramic Lift', model: 'PNR-550', status: 'Offline', location: 'Atrium' },
    ]
  ), []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '400',
    },
    profileIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileIconText: {
      color: Colors[colorScheme ?? 'dark'].text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
      lineHeight: 24,
    },
    listContentContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Sites</Text>
          <Text style={styles.subtitle}>View Your Installed Elevators</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {(userProfile?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {lifts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No lift data is available at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={lifts}
          renderItem={({ item }) => <LiftCard lift={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav active="sites" />
    </View>
  );
}





