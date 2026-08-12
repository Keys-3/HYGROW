import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  
  return 'http://localhost:3000';
};

export const BACKEND_URL = getBackendUrl();
