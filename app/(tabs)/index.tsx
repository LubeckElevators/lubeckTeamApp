import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to sites screen
    router.replace('/sites');
  }, []);

  return <View />;
}
