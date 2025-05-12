// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE,
  authDomain: "blog-aeffd.firebaseapp.com",
  projectId: "blog-aeffd",
  storageBucket: "blog-aeffd.appspot.com",
  messagingSenderId: "797959051369",
  appId: "1:797959051369:web:a4e32bcb6d0d37b752aaf8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


  
  