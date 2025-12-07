import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id",
};

// Initialize Firebase
let app;
let auth;
let googleProvider;
let db;

try {
    if (firebaseConfig.apiKey === "mock_key") {
        throw new Error("Using mock keys - skipping real Firebase init");
    }

    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
} catch (error) {
    console.warn("Firebase initialization skipped/failed, using mock services:", error.message);
    auth = null; // Ensure auth is null so components use mockAuth
    googleProvider = null;
    db = null;
}

// Mock Auth Service for Demo/Dev
export const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
        // Check local storage for mock session
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('mockUser') : null;
        if (storedUser) {
            callback(JSON.parse(storedUser));
        } else {
            callback(null);
        }
        return () => { }; // Unsubscribe function
    },
    signInWithPopup: async () => {
        const mockUser = {
            uid: 'mock-user-123',
            displayName: 'Demo User',
            email: 'demo@rentai.app',
            photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff'
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
        }
        // Trigger a reload or state update would be needed in a real event emitter, 
        // but for now we rely on the component re-checking or window reload.
        // Better: dispatch a custom event
        window.dispatchEvent(new Event('mock-auth-change'));
        return { user: mockUser };
    },
    signOut: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mockUser');
        }
        window.dispatchEvent(new Event('mock-auth-change'));
    }
};

export { auth, googleProvider, db };
