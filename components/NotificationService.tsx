import * as Notifications from 'expo-notifications';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Store push token in Firebase
export const storePushToken = async (userEmail: string) => {
  try {
    // Get existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permissions granted, get token and store
    if (finalStatus === 'granted') {
      const token = await Notifications.getExpoPushTokenAsync();

      // Store token in Firebase
      try {
        await setDoc(doc(db, 'users', userEmail), {
          pushToken: token.data,
          pushTokenUpdated: new Date(),
        }, { merge: true });

        console.log('✅ Push token stored for user:', userEmail);
      } catch (error) {
        // Commenting out Firebase permissions error for now
        // console.error('Error storing push token:', error);
        console.log('⚠️ Push token storage skipped due to permissions (commented out)');
      }
      return token.data;
    } else {
      console.log('❌ Notification permissions denied');
      return null;
    }
  } catch (error) {
    console.error('Error storing push token:', error);
    return null;
  }
};

// Handle notification response (when user taps notification)
export const setupNotificationHandler = (navigation: any) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;

    // Handle different notification types
    if (data.type === 'new_site') {
      // Navigate to sites tab
      navigation.navigate('(tabs)', { screen: 'sites' });
    } else if (data.type === 'new_complaint') {
      // Navigate to complaints tab
      navigation.navigate('(tabs)', { screen: 'complaints' });
    }
  });

  return subscription;
};

// Test notification (for development)
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'This is a test notification!',
      data: { type: 'test' },
    },
    trigger: null, // Show immediately
  });
};
