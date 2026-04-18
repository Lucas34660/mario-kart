import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBaqP0Gsh_5qyA7CsfGjZXsKYCR_SZ_Y1w",
  authDomain: "mario-kart-turnier-cd64f.firebaseapp.com",
  databaseURL: "https://mario-kart-turnier-cd64f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mario-kart-turnier-cd64f",
  storageBucket: "mario-kart-turnier-cd64f.firebasestorage.app",
  messagingSenderId: "205962333108",
  appId: "1:205962333108:web:16000a253bd21424a040e1",
  measurementId: "G-FSXFMK0LWQ",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
