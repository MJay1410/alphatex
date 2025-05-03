import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbqAMpetIKklqBqmVkz7bBA06YZd8Ny_0",
  authDomain: "manniru.firebaseapp.com",
  databaseURL: "https://manniru.firebaseio.com",
  projectId: "manniru",
  storageBucket: "manniru.firebasestorage.app",
  messagingSenderId: "917373566308",
  appId: "1:917373566308:web:7ff858ea688872ce368e71"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app; 