// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY ,
  authDomain: "aimodel-1adbb.firebaseapp.com",
  projectId: "aimodel-1adbb",
  storageBucket: "aimodel-1adbb.firebasestorage.app",
  messagingSenderId: "296868211415",
  appId: "1:296868211415:web:81c1fb0ad1d589a8a7de92",
  measurementId: "G-TD4MSKETR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);