# Firebase Setup Guide for Cloud Sync (Optional for Developers)

**Note:** For regular users, Google Sign-In and cloud sync work out of the box - no setup required! This guide is only for developers who want to use their own Firebase backend instead of the shared one.

## Default Configuration

PollinChat comes with a pre-configured Firebase backend that allows anyone to sign in with Google and sync their data across devices. Your data is encrypted and private to your Google account.

## Custom Firebase Setup (Optional)

If you're a developer and want to use your own Firebase project instead of the shared backend, follow these steps:

### 1. Create a Firebase Project (Prerequisites)

Before starting, ensure you have:
- A Google account
- Access to [Firebase Console](https://console.firebase.google.com)

Steps:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "PollinChat")
4. Follow the prompts to create your project

### 2. Enable Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started" if this is your first time
3. Go to the **Sign-in method** tab
4. Click on **Google** in the providers list
5. Enable the toggle switch
6. Select a support email
7. Click **Save**

### 3. Create a Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (recommended) or "Start in test mode" for development
4. Select a Cloud Firestore location closest to your users
5. Click **Enable**

### 4. Set Up Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

### 5. Register Your Web App

1. In your Firebase project overview, click the **Web** icon (</>) to add a web app
2. Enter an app nickname (e.g., "PollinChat Web")
3. Check "Also set up Firebase Hosting" if you want to host your app on Firebase (optional)
4. Click **Register app**
5. Copy the Firebase configuration object shown

### 6. Update PollinChat Configuration

1. Open `app.js` in your PollinChat directory
2. Find the Firebase configuration section (around line 8):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBvH8Y7fZN9mXx4qK5jP2wL3nR6tU8vC9s",
    authDomain: "pollinchat-sync.firebaseapp.com",
    projectId: "pollinchat-sync",
    storageBucket: "pollinchat-sync.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abc123def456ghi789"
};
```

3. Replace it with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

4. Save the file

### 7. Test the Integration

1. Open PollinChat in your browser
2. Click the "Sign in with Google" button in the sidebar
3. Complete the Google sign-in flow
4. Your chats and settings should now sync automatically!

## How It Works

### Data Synchronization

- **Automatic Sync**: When you're signed in, your chats and settings automatically sync to the cloud every time you make a change
- **Cross-Device Access**: Sign in on any device to access your chats and settings
- **Offline Support**: Your data is still stored locally in your browser, so you can use the app offline

### Data Structure

Your data is stored in Firestore under the following structure:

```
users/
  {userId}/
    chats/
      data/
        - chats: [array of chat objects]
        - timestamp: [last sync time]
    settings/
      data/
        - settings: {settings object}
        - timestamp: [last sync time]
```

### Privacy & Security

- **Your Data**: Only you can access your data. Firestore security rules ensure users can only read and write their own data
- **Encryption**: All data is encrypted in transit and at rest by Firebase
- **No Server Code**: PollinChat uses direct client-to-Firebase communication, so no intermediate servers handle your data

## Troubleshooting

### "Unable to connect to cloud sync service" error

This error means Firebase couldn't be reached. Common causes:
- Network connectivity issues
- Ad blockers or privacy extensions blocking Firebase
- Browser privacy settings preventing third-party connections

The app will continue to work with local storage only.

### Using the Default Shared Backend

By default, PollinChat uses a shared Firebase backend. All users' data is:
- Encrypted and private to their Google account
- Isolated using Firestore security rules
- Only accessible when signed in with their Google account

If you prefer to use your own Firebase project, follow the setup steps above.

### "Cloud sync is not configured" error (Old)

If you see this error, you may be using an older version. Update to the latest version which includes the pre-configured backend.

### Sign-in popup blocked

Make sure your browser allows popups for the PollinChat domain.

### Data not syncing

1. Check the browser console for errors
2. Verify your Firestore security rules are correct
3. Make sure you're signed in (check the sidebar)
4. Try signing out and signing back in

### Testing locally with different Firebase projects

If you're testing locally, you can use Firebase Local Emulator Suite:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase: `firebase init`
3. Start emulators: `firebase emulators:start`
4. Update your Firebase config to point to the emulators

## Cost Considerations

Firebase offers a generous free tier:

- **Authentication**: Free for all providers
- **Firestore**: 
  - 50,000 reads/day (free)
  - 20,000 writes/day (free)
  - 20,000 deletes/day (free)
  - 1 GB storage (free)

For typical PollinChat usage with sync enabled, you should stay well within the free tier limits. Monitor your usage in the Firebase Console.

## Support

For issues related to:
- **PollinChat**: Open an issue on the GitHub repository
- **Firebase**: Visit [Firebase Support](https://firebase.google.com/support)

---

**Note**: The Firebase setup is optional. If you don't configure Firebase, PollinChat will continue to work with local storage only.
