import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { userProfile, logout } = useUser();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // User profile data
  const profileData = {
    aadhar: "5788 6888 9201",
    email: "raghav.sachdeveloper@gmail.com",
    name: "Raghav Sachdev",
    phone: "8178648498",
    profilepic: "https://media.licdn.com/dms/image/v2/D4D03AQEi1foHXK-r_w/profile-displayphoto-shrink_400_400/B4DZbzs07LGYAk-/0/1747845337681?e=1759363200&v=beta&t=kyEJJZPUJR6XlMw4mPpJa-q6zkI7tM0RW_QdmKKCORI",
    role: "electrical_contractor"
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    headerCard: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 3,
      borderColor: Colors[colorScheme ?? 'dark'].background,
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 37,
    },
    imageLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 37,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
    },
    nameSection: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 4,
    },
    role: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].tint,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoSection: {
      marginTop: 8,
    },
    infoItem: {
      marginBottom: 8,
    },
    infoItemLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    infoItemLabel: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoItemValue: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      fontWeight: '500',
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 12,
      marginTop: 8,
    },
    detailsCard: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    detailIcon: {
      width: 32,
      textAlign: 'center',
      marginRight: 12,
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].tint,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 11,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].border,
      marginVertical: 8,
    },
    logoutButton: {
      backgroundColor: '#FF6B6B',
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: '#FF6B6B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors[colorScheme ?? 'dark'].text }}>No user profile found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profileData.profilepic && !imageError ? (
                <>
                  <Image
                    source={{ uri: profileData.profilepic }}
                    style={styles.profileImage}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    onLoadStart={() => {
                      setImageLoading(true);
                      setImageError(false);
                    }}
                    onLoadEnd={() => setImageLoading(false)}
                    resizeMode="cover"
                  />
                  {imageLoading && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(profileData.name)}
                </Text>
              )}
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{profileData.name}</Text>
              <Text style={styles.role}>{profileData.role.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          {/* Quick Info - Email and Phone in separate lines */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLabelContainer}>
                <MaterialIcons name="email" size={16} color={Colors[colorScheme ?? 'dark'].tint} />
                <Text style={styles.infoItemLabel}> Email</Text>
              </View>
              <Text style={styles.infoItemValue}>{profileData.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLabelContainer}>
                <MaterialIcons name="phone" size={16} color={Colors[colorScheme ?? 'dark'].tint} />
                <Text style={styles.infoItemLabel}> Phone</Text>
              </View>
              <Text style={styles.infoItemValue}>{profileData.phone}</Text>
            </View>
          </View>
        </View>

        {/* Detailed Information */}
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Ionicons name="person" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{profileData.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Ionicons name="mail" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{profileData.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Ionicons name="call" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{profileData.phone}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Ionicons name="card" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Aadhar Number</Text>
              <Text style={styles.detailValue}>{profileData.aadhar}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Ionicons name="briefcase" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Professional Role</Text>
              <Text style={styles.detailValue}>{profileData.role.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
