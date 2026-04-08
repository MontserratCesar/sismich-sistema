import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzGSru6AvnSdTptzcAV3SbpjPvnqWRis8",
  authDomain: "sismich-sistema.firebaseapp.com",
  projectId: "sismich-sistema",
  storageBucket: "sismich-sistema.firebasestorage.app",
  messagingSenderId: "462068765972",
  appId: "1:462068765972:web:f49e28baa6635125d4de01",
  measurementId: "G-KXW8S3XHNC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app);    // Autenticación