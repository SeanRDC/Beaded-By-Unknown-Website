import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace these with your actual keys from Step 1
const firebaseConfig = {
  apiKey: "AIzaSyDtvaKhY5KLFPzjWgUpk5-Ia8kZWzNtYoE",
  authDomain: "beaded-shop.firebaseapp.com",
  projectId: "beaded-shop",
  storageBucket: "beaded-shop.firebasestorage.app",
  messagingSenderId: "569398698089",
  appId: "1:569398698089:web:711de582c4f896bb4ec2f8",
  measurementId: "G-FJ3BHZ9Z7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();