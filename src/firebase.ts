import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDoMpE3dyw-CjJ7_xC2aEsbMVp380hijzE",
  authDomain: "imoveis-app-mae-9fdad.firebaseapp.com",
  projectId: "imoveis-app-mae-9fdad",
  storageBucket: "imoveis-app-mae-9fdad.firebasestorage.app",
  messagingSenderId: "20953802047",
  appId: "1:20953802047:web:b2ade213cbf9a3d10fdf8a",
  measurementId: "G-DWKSM2DQEC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
