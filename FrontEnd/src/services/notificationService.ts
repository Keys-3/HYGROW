/**
 * Farm Help — Notification Service
 * Manages native local notifications and provides web browser fallbacks.
 */

import { Platform } from 'react-native';

let Notifications: any = {
  AndroidNotificationPriority: { HIGH: 'high' }
};

try {
  Notifications = require('expo-notifications');
  
  // Configure how notifications are handled when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.warn('expo-notifications is not available (likely running in Expo Go on SDK 53+). Notifications will be mocked.', error);
  
  // Provide mock implementations
  Notifications.scheduleNotificationAsync = async () => {
    console.log('[Mock Notification] Scheduled notification');
  };
}

export const notificationService = {
  /**
   * Triggers a local notification immediately
   */
  async sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
    try {
      // Handle Web environment gracefully
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (window.Notification.permission === 'granted') {
            new window.Notification(title, { body });
            return;
          }
        }
        console.log(`[Web Notification Fallback] ${title} - ${body}`);
        return;
      }

      // Schedule instant native local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // trigger immediately
      });
    } catch (error) {
      console.warn('Error scheduling local notification:', error);
    }
  }
};

export default notificationService;
