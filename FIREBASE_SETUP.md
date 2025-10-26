# Firebase Cloud Functions Setup for Push Notifications

## 🚀 Quick Setup Guide

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Configure Your Project
Update `.firebaserc` with your Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 4. Install Function Dependencies
```bash
cd functions
npm install
```

### 5. Deploy Functions
```bash
firebase deploy --only functions
```

## 🔧 What This Does

### New Site Notifications
- **Trigger**: When a document is added to `team/{userEmail}/sites/{siteId}`
- **Notification**: "New Site Added!" with subtitle "A new site has been linked to your account"
- **Target**: Only the user who owns that site

### New Complaint Notifications
- **Trigger**: When a document is added to `team/{userEmail}/complaints/{complaintId}`
- **Notification**: "New Complaint Added!" with subtitle "A new complaint has been assigned to you"
- **Target**: Only the user who received the complaint

## 🧪 Testing

### Test Locally
```bash
cd functions
npm run serve
```

### Test Functions
```bash
firebase functions:shell
notifyNewSite({userEmail: 'test@example.com', siteId: 'test123'})
```

## 📱 Client-Side Setup

The app automatically:
- ✅ Requests notification permissions on login
- ✅ Gets push token and stores in Firebase
- ✅ Handles notification taps to navigate to relevant screens
- ✅ Works when app is closed, background, or foreground

## 🔍 Troubleshooting

### Check Function Logs
```bash
firebase functions:log --only notifyNewSite,notifyNewComplaint
```

### Common Issues:
1. **No notifications received**: Check if push token is stored in `users/{email}`
2. **Functions not deploying**: Ensure Firebase project has billing enabled
3. **Expo API errors**: Verify your Expo account is set up correctly

## 📋 Requirements

- ✅ Firebase project with Firestore enabled
- ✅ Firebase Functions billing enabled (required for external API calls)
- ✅ Expo account for push notifications
- ✅ Android/iOS app with notification permissions

## 🎯 Expected Behavior

1. **User logs in** → Push token stored in Firebase
2. **New site added** → Cloud Function triggered → Push notification sent
3. **App closed** → Notification appears in device notification center
4. **User taps notification** → App opens and navigates to relevant tab

## 💡 Pro Tips

- Functions have a cold start delay (~1-2 seconds first time)
- Test with Firebase emulators locally before deploying
- Monitor function usage in Firebase Console
- Keep function code lightweight for better performance

---

**Need help?** Check Firebase documentation or Expo notifications docs!
