import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { userProfile, logout } = useUser();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'dark'].background }]}>
      <View style={styles.content}>
        <Text style={[styles.welcomeText, { color: Colors[colorScheme ?? 'dark'].text }]}>
          Welcome to Lubeck Team!
        </Text>

        <Text style={[styles.userInfo, { color: Colors[colorScheme ?? 'dark'].icon }]}>
          Hello, {userProfile?.name || 'User'}
        </Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'dark'].text }]}>
            You have successfully logged in.
          </Text>
          <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'dark'].icon }]}>
            This is your main dashboard screen.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'dark'].tint }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: '#FFFFFF' }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  userInfo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  logoutButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
