import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { setupNotificationHandler } from '@/components/NotificationService';
import { UserProvider, useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Custom dark theme to prevent white flashes
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1C1C1E',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#333',
    primary: '#D4AF37',
  },
};

// Component to handle initial navigation after loading
function NavigationHandler() {
  const router = useRouter();
  const { userProfile, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      // Set up notification handler
      const notificationSubscription = setupNotificationHandler(router);

      // Small delay to ensure smooth transition from native splash screen
      const timer = setTimeout(() => {
        if (userProfile) {
          router.replace('/(tabs)/sites');
        } else {
          router.replace('/login');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        notificationSubscription.remove();
      };
    }
  }, [isLoading, userProfile, router]);

  return null; // This component doesn't render anything
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <UserProvider>
        <NavigationHandler />
        <ThemeProvider value={CustomDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1C1C1E' },
              animation: 'none',
              presentation: 'transparentModal',
            }}
          >
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1C1C1E' },
                animation: 'none',
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1C1C1E' },
                animation: 'none',
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{
                contentStyle: { backgroundColor: '#1C1C1E' },
                animation: 'none',
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </UserProvider>
    </View>
  );
}
