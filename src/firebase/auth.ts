import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

const GUEST_STORAGE_KEY = 'mocktrack_current_user';
const authListeners = new Set<(user: AppUser | null) => void>();

function getStoredLocalUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function notifyListeners(user: AppUser | null) {
  authListeners.forEach((listener) => listener(user));
}

const googleProvider = new GoogleAuthProvider();

export const continueAsGuest = (displayName: string = 'Aspirant'): AppUser => {
  const guestUser: AppUser = {
    uid: 'guest_user',
    displayName,
    email: 'guest@mocktracker.local',
    photoURL: null,
    isAnonymous: true,
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  notifyListeners(guestUser);
  return guestUser;
};

export const createLocalAccount = (email: string, displayName?: string): AppUser => {
  const localUser: AppUser = {
    uid: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    displayName: displayName || email.split('@')[0] || 'Aspirant',
    email,
    photoURL: null,
    isAnonymous: false,
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(localUser));
  notifyListeners(localUser);
  return localUser;
};

export const signInWithGoogle = async (): Promise<AppUser> => {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured in .env. Click "Continue as Guest" to use MockTracker offline without setup.'
    );
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<AppUser> => {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured in .env. Click "Continue as Guest" to use MockTracker offline without setup.'
    );
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string): Promise<AppUser> => {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured in .env. Click "Continue as Guest" to use MockTracker offline without setup.'
    );
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const updateUserProfile = async (displayName: string): Promise<AppUser> => {
  const trimmed = displayName.trim();
  if (!trimmed) {
    throw new Error('Name cannot be empty.');
  }

  if (auth && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: trimmed });
  }

  const localUser = getStoredLocalUser();
  if (localUser) {
    const updated: AppUser = { ...localUser, displayName: trimmed };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    notifyListeners(updated);
    return updated;
  }

  if (auth && auth.currentUser) {
    const updatedUser: AppUser = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: trimmed,
      photoURL: auth.currentUser.photoURL,
      isAnonymous: auth.currentUser.isAnonymous,
    };
    notifyListeners(updatedUser);
    return updatedUser;
  }

  throw new Error('No user is currently signed in');
};

export const signOutUser = async (): Promise<void> => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  }
  notifyListeners(null);
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth || !isFirebaseConfigured) {
    throw new Error('Firebase authentication is not configured.');
  }
  return sendPasswordResetEmail(auth, email);
};

export const onAuthChange = (callback: (user: AppUser | null) => void): (() => void) => {
  authListeners.add(callback);

  // Check local guest session first
  const localUser = getStoredLocalUser();
  if (localUser) {
    callback(localUser);
  } else if (!auth || !isFirebaseConfigured) {
    // If Firebase isn't configured, immediately emit null so Login screen renders
    callback(null);
  }

  // Also subscribe to Firebase if active
  let firebaseUnsub = () => {};
  if (auth) {
    firebaseUnsub = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      const stored = getStoredLocalUser();
      if (!stored) {
        callback(firebaseUser);
      }
    });
  }

  return () => {
    authListeners.delete(callback);
    firebaseUnsub();
  };
};
