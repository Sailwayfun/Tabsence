// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6FBXo1fXHD25XpBM6notUM7v6U7mt6mU",
  authDomain: "wordle-sail.firebaseapp.com",
  projectId: "wordle-sail",
  //   storageBucket: "wordle-sail.appspot.com",
  messagingSenderId: "194079596933",
  appId: "1:194079596933:web:0037db26cc7663cd0724ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
