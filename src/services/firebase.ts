import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYARQ6NRlIQ4TfDCHmLI3sZq8r6h3TFDI",
  authDomain: "electro-store-29284.firebaseapp.com",
  projectId: "electro-store-29284",
  storageBucket: "electro-store-29284.firebasestorage.app",
  messagingSenderId: "241854764297",
  appId: "1:241854764297:web:a2bda13fcbc8234c5cafd8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
