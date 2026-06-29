/**
 * Farm Help — Permission Manager Service
 * Manages checking and requesting camera, storage, and notification permissions.
 */

import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface AppPermissions {
  camera: boolean;
  storage: boolean;
  notifications: boolean;
}

export const permissionManager = {
  /**
   * Checks the status of all essential permissions
   */
  async checkPermissions(): Promise<AppPermissions> {
    const status: AppPermissions = {
      camera: false,
      storage: false,
      notifications: false,
    };

    try {
      // 1. Camera Permissions
      if (Platform.OS === 'web') {
        status.camera = true; // Permitted on web by default for convenience
      } else {
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        status.camera = cameraStatus.granted;
      }

      // 2. Storage / Media Library Permissions
      if (Platform.OS === 'web') {
        status.storage = true;
      } else {
        const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        status.storage = libraryStatus.granted;
      }

      // 3. Notification Permissions
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          status.notifications = window.Notification.permission === 'granted';
        } else {
          status.notifications = false;
        }
      } else {
        const notifStatus = await Notifications.getPermissionsAsync();
        status.notifications = notifStatus.granted || notifStatus.status === 'granted';
      }
    } catch (error) {
      console.warn('Error checking permissions in permissionManager:', error);
    }

    return status;
  },

  /**
   * Request camera permission
   */
  async requestCamera(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return true;
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting camera permission:', error);
      return false;
    }
  },

  /**
   * Request storage (media library) permission
   */
  async requestStorage(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return true;
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting storage permission:', error);
      return false;
    }
  },

  /**
   * Request local & push notifications permission
   */
  async requestNotifications(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const result = await window.Notification.requestPermission();
          return result === 'granted';
        }
        return false;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('Error requesting notifications permission:', error);
      return false;
    }
  },

  /**
   * Requests all essential permissions sequentially
   */
  async requestAll(): Promise<AppPermissions> {
    const camera = await this.requestCamera();
    const storage = await this.requestStorage();
    const notifications = await this.requestNotifications();

    return {
      camera,
      storage,
      notifications,
    };
  }
};

export default permissionManager;
