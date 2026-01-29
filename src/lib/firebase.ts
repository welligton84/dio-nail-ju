import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Firebase configuration (Hardcoded for production reliability)
const firebaseConfig = {
    apiKey: "AIzaSyB7LMBUsrQGAoCOkTk-7a93mmQrKZo_6IM",
    authDomain: "julianamirandaconcept.firebaseapp.com",
    projectId: "julianamirandaconcept",
    storageBucket: "julianamirandaconcept.firebasestorage.app",
    messagingSenderId: "912211096106",
    appId: "1:912211096106:web:885061956b696fbe738953",
};

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
    return !!firebaseConfig.apiKey;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Initialize Firebase only if configured
if (isFirebaseConfigured()) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
} else {
    console.log('Firebase not configured. Running in demo mode with localStorage.');
}

export { app, auth, db };
