import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDoMpE3dyw-CjJ7_xC2aEsbMVp380hijzE",
  authDomain: "imoveis-app-mae.firebaseapp.com",
  projectId: "imoveis-app-mae",
  storageBucket: "imoveis-app-mae.firebasestorage.app",
  messagingSenderId: "20953802047",
  appId: "1:20953802047:web:b2ade213cbf9a3d10fdf8a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
