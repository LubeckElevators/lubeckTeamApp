// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl5JdqU0zViynp4barAgmazgtD6CH_W2E",
  authDomain: "lubeck-elevators.firebaseapp.com",
  projectId: "lubeck-elevators",
  storageBucket: "lubeck-elevators.appspot.com",
  messagingSenderId: "282617292233",
  appId: "1:282617292233:web:57544bb98b4c57bf35f418",
  measurementId: "G-62Q2VX54Y9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

