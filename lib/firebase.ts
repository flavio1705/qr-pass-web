import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC2iaTC6ShcTV47xweWLjpw06HhyvwAXR0",
  authDomain: "sendqrmessage.firebaseapp.com",
  projectId: "sendqrmessage",
  storageBucket: "sendqrmessage.firebasestorage.app",
  messagingSenderId: "810810685644",
  appId: "1:810810685644:web:c7d7dea837e22b633d6a69",
  measurementId: "G-WE707T9231"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)