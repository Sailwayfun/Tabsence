import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6FBXo1fXHD25XpBM6notUM7v6U7mt6mU",
  authDomain: "wordle-sail.firebaseapp.com",
  projectId: "wordle-sail",
  messagingSenderId: "194079596933",
  appId: "1:194079596933:web:0037db26cc7663cd0724ec",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
