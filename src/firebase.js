// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpeXRea8I6on2p0Os2Ws2Ewrvsi8AkXdk",
  authDomain: "fir-indcoph2.firebaseapp.com",
  projectId: "fir-indcoph2",
  storageBucket: "fir-indcoph2.firebasestorage.app",
  messagingSenderId: "730635016107",
  appId: "1:730635016107:web:a88c0a462dba3f8486e4ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Check if we should use demo mode based on Firebase configuration
// This will be updated based on whether auth is actually available
export let DEMO_MODE = false;

export default app;