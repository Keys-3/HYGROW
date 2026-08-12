/**
 * Farm Help — Centralized Configuration
 * 
 * Manages environment variables and application constants.
 * Provides type safety and default values.
 */
import { getBackendUrl } from './apiConfig';

const Config = {
  // Firebase
  firebase: {
    apiKey: "AIzaSyAsW3UdiapN41zCfAd5Wi_kQNzLzojeORk",
    authDomain: "farm-help-383f1.firebaseapp.com",
    projectId: "farm-help-383f1",
    storageBucket: "farm-help-383f1.appspot.com",
    messagingSenderId: "149037929627",
    appId: "1:149037929627:web:eee26088fc7342420f623e",
    measurementId: "G-45ERXPGKTZ"
  },

  api: {
    baseUrl: getBackendUrl(),
    timeout: 10000,
  },

  // App Metadata
  app: {
    name: 'Farm Help',
    version: '1.0.0',
    isProduction: process.env.NODE_ENV === 'production',
  },
};

// Simple validation to warn if critical values are missing in dev
if (!Config.app.isProduction) {
  const missing = [];
  if (!Config.firebase.apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!Config.firebase.projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  
  if (missing.length > 0) {
    console.warn(`[Config] Missing environment variables: ${missing.join(', ')}`);
  }
}

export default Config;
