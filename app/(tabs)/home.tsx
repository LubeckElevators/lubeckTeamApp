import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { userProfile, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'dark'].border,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 5,
    },
    userInfo: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 15,
    },
    card: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].icon,
      lineHeight: 20,
    },
    logoutButton: {
      backgroundColor: '#FF4444',
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.userInfo}>
          {userProfile?.name} • {userProfile?.email}
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dashboard</Text>
            <Text style={styles.cardDescription}>
              View your team's performance metrics and recent activities.
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Team Management</Text>
            <Text style={styles.cardDescription}>
              Manage team members, assign tasks, and track progress.
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reports</Text>
            <Text style={styles.cardDescription}>
              Generate and view detailed reports and analytics.
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Project Updates</Text>
            <Text style={styles.cardDescription}>
              Latest updates on ongoing projects and team activities.
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardDescription}>
              Important notifications and alerts for your attention.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}





