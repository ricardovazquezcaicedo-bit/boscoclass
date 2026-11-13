// Google Workspace Authentication & Token Management Service
// Implements client-side Firebase Auth with Google OAuth scopes for Google Workspace

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Workspace scopes configured for BoscoClass
export const GOOGLE_WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/tasks',
];

const provider = new GoogleAuthProvider();
// Attach all scopes to GoogleAuthProvider
GOOGLE_WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in state
let isSigningIn = false;
// In-memory access token cache (NEVER persisted to localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

export interface GoogleAuthResult {
  user: User;
  accessToken: string;
}

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedGoogleUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Initiates the Google OAuth popup flow and captures the access token
 */
export const googleSignIn = async (): Promise<GoogleAuthResult | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se recibió token de acceso de Google');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al autenticar con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns the current cached access token in memory
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Returns the current authenticated Google user
 */
export const getCurrentGoogleUser = (): User | null => {
  return cachedGoogleUser || auth.currentUser;
};

/**
 * Check if active Google connection exists with an access token
 */
export const isGoogleConnected = (): boolean => {
  return !!cachedAccessToken && !!(cachedGoogleUser || auth.currentUser);
};

/**
 * Sign out of Google and clear in-memory token
 */
export const googleSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
    cachedGoogleUser = null;
  }
};
