import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Helper function to send Expo push notification
async function sendExpoNotification(pushToken: string, title: string, body: string, data?: any) {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: title,
        body: body,
        data: data || {},
        sound: 'default',
        priority: 'default',
        ttl: 86400, // 24 hours
      }),
    });

    if (!response.ok) {
      throw new Error(`Expo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}

// Trigger notification when a new site is added to team/{userEmail}/sites/{siteId}
export const notifyNewSite = functions.firestore
  .document('team/{userEmail}/sites/{siteId}')
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const userEmail = context.params.userEmail;
    const siteData = snap.data();

    console.log('🔔 New site added for user:', userEmail);

    try {
      // Get user's push token
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userEmail)
        .get();

      if (!userDoc.exists) {
        console.log('❌ User document not found:', userEmail);
        return null;
      }

      const userData = userDoc.data();
      const pushToken = userData?.pushToken;

      if (!pushToken) {
        console.log('⚠️ No push token found for user:', userEmail);
        return null;
      }

      // Send notification
      await sendExpoNotification(
        pushToken,
        'New Site Added!',
        'A new site has been linked to your account',
        {
          type: 'new_site',
          siteId: context.params.siteId,
          userEmail: userEmail
        }
      );

      console.log('✅ New site notification sent to:', userEmail);
      return null;

    } catch (error) {
      console.error('❌ Error in notifyNewSite:', error);
      return null;
    }
  });

// Trigger notification when a new complaint is added to team/{userEmail}/complaints/{complaintId}
export const notifyNewComplaint = functions.firestore
  .document('team/{userEmail}/complaints/{complaintId}')
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
    const userEmail = context.params.userEmail;
    const complaintData = snap.data();

    console.log('🔔 New complaint added for user:', userEmail);

    try {
      // Get user's push token
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userEmail)
        .get();

      if (!userDoc.exists) {
        console.log('❌ User document not found:', userEmail);
        return null;
      }

      const userData = userDoc.data();
      const pushToken = userData?.pushToken;

      if (!pushToken) {
        console.log('⚠️ No push token found for user:', userEmail);
        return null;
      }

      // Send notification
      await sendExpoNotification(
        pushToken,
        'New Complaint Added!',
        'A new complaint has been assigned to you',
        {
          type: 'new_complaint',
          complaintId: context.params.complaintId,
          userEmail: userEmail
        }
      );

      console.log('✅ New complaint notification sent to:', userEmail);
      return null;

    } catch (error) {
      console.error('❌ Error in notifyNewComplaint:', error);
      return null;
    }
  });
