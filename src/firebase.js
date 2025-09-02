// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCLMyt6-Qit_WlMKiR3vFt4GOYP8T_8yjk",
  authDomain: "taskmaster-9a5d4.firebaseapp.com",
  databaseURL: "https://taskmaster-9a5d4-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "taskmaster-9a5d4",
  storageBucket: "taskmaster-9a5d4.appspot.com",
  messagingSenderId: "451146162906",
  appId: "1:451146162906:web:e98484a8ad4af5fc9873e3",
  measurementId: "G-VP7YLJ5D9P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export { auth };
