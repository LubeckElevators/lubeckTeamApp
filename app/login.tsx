import CustomAlert from '@/components/CustomAlert';
import { Colors } from '@/constants/Colors';
import { UserProfile, useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Login Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Use the team/{emailID}/ path structure
      const userDocRef = doc(db, 'team', email.trim());
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if password field exists and matches
        if (userData.password && userData.password === password) {
          // Create user profile from Firestore data
          const userProfile: UserProfile = {
            id: userDoc.id,
            name: userData.name || userData.fullName || 'User',
            email: email.trim(),
            role: userData.role || userData.position || 'user',
            password: password,
            profileComplete: true,
          };

          // Use the login function from UserContext which handles persistence
          await login(email.trim(), password);

          // Navigate to home screen
          router.replace('/(tabs)/home');
        } else {
          showAlert('Login Error', 'Invalid email or password.');
        }
      } else {
        showAlert('Login Error', 'User not found. Please check your email.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 10,
    },
    title: {
      fontSize: 22,
      color: Colors[colorScheme ?? 'dark'].icon,
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 55,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].icon,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].text,
    },
    button: {
      width: '100%',
      height: 55,
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors[colorScheme ?? 'dark'].background}}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={styles.container}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: '#FFFFFF' }]}>Lubeck Team</Text>
          <Text style={styles.title}>Client Access</Text>
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope-o" size={20} color={Colors[colorScheme ?? 'dark'].icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={24} color={Colors[colorScheme ?? 'dark'].icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </Pressable>

        </View>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
