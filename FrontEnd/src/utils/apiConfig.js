import { Platform } from 'react-native';

export const getBackendUrl = () => {
  // If we are on web, we should ideally use localhost to avoid CORS/Private Network issues
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // If there's an environment variable set (e.g., local IP for physical devices), use it
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  // Fallbacks for simulators/emulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  return 'http://localhost:3000'; // iOS simulator fallback
};

export const BACKEND_URL = getBackendUrl();
