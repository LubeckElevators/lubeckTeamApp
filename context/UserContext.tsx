import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  profileComplete: boolean;
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

export function UserProvider({ children }: UserProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing authentication
    const checkAuth = async () => {
      try {
        // Simulate API call to check authentication
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll simulate no user is logged in
        // In a real app, you'd check AsyncStorage, SecureStore, or your auth service
        setUserProfile(null);
      } catch (error) {
        console.error('Auth check failed:', error);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      const mockUser: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'user',
        password: password,
        profileComplete: true,
      };
      
      setUserProfile(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserProfile(null);
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
