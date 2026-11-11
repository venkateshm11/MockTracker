import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Validate that real Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  apiKey &&
  typeof apiKey === 'string' &&
  apiKey.length > 5 &&
  apiKey !== 'your-api-key' &&
  projectId &&
  typeof projectId === 'string' &&
  projectId !== 'your-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyAPkaOrc8w7j8Q49ozBNG-ewpTBJJ5qW6A",
      authDomain: "mocktracker-7fc05.firebaseapp.com",
      projectId: "mocktracker-7fc05",
      storageBucket: "mocktracker-7fc05.firebasestorage.app",
      messagingSenderId: "937327396612",
      appId: "1:937327396612:web:66843468a645c52a72b251"
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization failed; defaulting to local/offline storage:', err);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };
export default app;


