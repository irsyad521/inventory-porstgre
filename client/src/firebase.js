// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: 'inventory-cf2cd.firebaseapp.com',
    projectId: 'inventory-cf2cd',
    storageBucket: 'inventory-cf2cd.appspot.com',
    messagingSenderId: '158543958395',
    appId: '1:158543958395:web:da75192b92f5be57d0adde',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
