import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { UserProvider } from '@/context/UserContext';
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
        <ThemeProvider value={CustomDarkTheme}>
          <Stack 
            initialRouteName="SplashScreen"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1C1C1E' },
              animation: 'none',
              presentation: 'transparentModal',
            }}
          >
            <Stack.Screen 
              name="SplashScreen" 
              options={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#1C1C1E' },
                animation: 'none',
              }} 
            />
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
