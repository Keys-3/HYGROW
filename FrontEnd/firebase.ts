import { initializeApp } from "firebase/app";
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAsW3UdiapN41zCfAd5Wi_kQNzLzojeORk",
  authDomain: "farm-help-383f1.firebaseapp.com",
  projectId: "farm-help-383f1",
  storageBucket: "farm-help-383f1.appspot.com",
  messagingSenderId: "149037929627",
  appId: "1:149037929627:web:eee26088fc7342420f623e",
  measurementId: "G-45ERXPGKTZ"
};

const app = initializeApp(firebaseConfig);

// Initialize auth with proper persistence
const auth: Auth = getAuth(app);

// Set persistence based on platform
if (Platform.OS === "web") {
  // Web: Use browser local persistence (survives browser restart)
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Failed to set auth persistence:", err);
  });
}
// For React Native, Firebase uses inMemoryPersistence by default,
// but the SDK v12+ has built-in support for AsyncStorage persistence
// which is automatically enabled when using getAuth()

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
