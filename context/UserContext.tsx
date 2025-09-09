import { db } from '@/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  aadhar?: string;
  profilepic?: string;
  password?: string; // Make password optional for stored profile
  profileComplete: boolean;
}

export interface StoredUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  aadhar?: string;
  profilepic?: string;
  profileComplete: boolean;
  loginTimestamp: number;
}

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

// Storage keys
const USER_PROFILE_KEY = '@lubeck_user_profile';
const USER_SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper functions for persistent storage
const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const storedProfile: StoredUserProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      aadhar: profile.aadhar,
      profilepic: profile.profilepic,
      profileComplete: profile.profileComplete,
      loginTimestamp: Date.now(),
    };
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(storedProfile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!storedProfile) return null;

    const parsedProfile: StoredUserProfile = JSON.parse(storedProfile);

    // Check if session has expired
    const now = Date.now();
    if (now - parsedProfile.loginTimestamp > USER_SESSION_TIMEOUT) {
      await AsyncStorage.removeItem(USER_PROFILE_KEY);
      return null;
    }

    // Convert stored profile back to UserProfile format
    return {
      id: parsedProfile.id,
      name: parsedProfile.name,
      email: parsedProfile.email,
      role: parsedProfile.role,
      phone: parsedProfile.phone,
      aadhar: parsedProfile.aadhar,
      profilepic: parsedProfile.profilepic,
      profileComplete: parsedProfile.profileComplete,
    };
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
};

const clearUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
};

export function UserProvider({ children }: UserProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user profile on app startup
    const checkAuth = async () => {
      try {
        const storedProfile = await getUserProfile();
        setUserProfile(storedProfile);
      } catch (error) {
        console.error('Profile check failed:', error);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get user data from Firestore - document path is /team/{email}/
      const userDocRef = doc(db, 'team', email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User profile not found in database');
      }

      const userData = userDoc.data();

      // Simple password validation
      if (userData.password && userData.password !== password) {
        throw new Error('Invalid password');
      }

      // Create user profile from Firestore data with correct field mapping
      const userProfile: UserProfile = {
        id: email, // Use email as ID since that's the document ID
        name: userData.name || 'Team Member',
        email: userData.email || email,
        role: userData.role || 'electrical_contractor',
        phone: userData.phone,
        aadhar: userData.aadhar,
        profilepic: userData.profilepic,
        profileComplete: true,
      };

      // Save user profile to persistent storage
      await saveUserProfile(userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearUserProfile();
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear the state even if storage clearing fails
      setUserProfile(null);
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...profile });
    }
  };

  const value: UserContextType = {
    userProfile,
    isLoading,
    setUserProfile,
    login,
    logout,
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
