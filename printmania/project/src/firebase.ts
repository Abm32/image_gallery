import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAao8XVmVOSqo-tnJQ_uYOJTSGi4GpqZd8",
  authDomain: "management-app-badbf.firebaseapp.com",
  projectId: "management-app-badbf",
  storageBucket: "management-app-badbf.appspot.com",
  messagingSenderId: "137673974959",
  appId: "1:137673974959:web:ab65c224979ea90eaf605a",
  measurementId: "G-Z4ZGJK6216"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };