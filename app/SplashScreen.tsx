import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const { userProfile, isLoading } = useUser();
  const loadingProgress = useSharedValue(0);

  useEffect(() => {
    // Start progress animation immediately
    loadingProgress.value = withTiming(1, { duration: 2500 });

    const timer = setTimeout(() => {
      // Wait for loading to complete before redirecting
      if (!isLoading) {
        // Check authentication status and redirect accordingly
        if (userProfile) {
          router.replace('/(tabs)/sites');
        } else {
          router.replace('/login');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, loadingProgress, userProfile, isLoading]);

  const loadingBarStyle = useAnimatedStyle(() => {
    return {
      width: `${loadingProgress.value * 100}%`,
    };
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1C1C1E',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 150,
      height: 150,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
    },
    tagline: {
      fontSize: 16,
      color: '#D4AF37',
      marginBottom: 40,
    },
    loadingContainer: {
      width: '60%',
      height: 5,
      backgroundColor: '#333',
      borderRadius: 5,
      overflow: 'hidden',
    },
    loadingBar: {
      height: '100%',
      backgroundColor: '#D4AF37',
      borderRadius: 5,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.appName}>Lubeck Team</Text>
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingBar, loadingBarStyle]} />
      </View>
    </View>
  );
}
