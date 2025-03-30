import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Print Firebase config to debug (without revealing full API key)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "";

// Log debug info
console.log("Firebase config:", {
  apiKeyPresent: apiKey ? true : false,
  apiKeyLength: apiKey ? apiKey.length : 0,
  projectId,
  appIdPresent: appId ? true : false,
});

const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  appId,
};

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Create fallback objects so the rest of the app doesn't crash
  app = {
    name: "firebase-initialization-failed",
    options: {},
    automaticDataCollectionEnabled: false,
  };
  
  auth = {
    app,
    name: "auth-initialization-failed",
    config: {},
  };
  
  googleProvider = new GoogleAuthProvider();
}

// Google sign-in function
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Get the user's credentials
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential) {
      throw new Error('Failed to get credential from result');
    }
    
    // Get the access token
    const token = credential.accessToken;
    // Get the user info
    const user = result.user;
    
    // Send the ID token to your backend for verification
    const idToken = await user.getIdToken();
    
    // Return the token to be sent to the server
    return {
      idToken,
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign out function
export async function signOut() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export { auth };