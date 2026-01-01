import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const PUSH_TOKEN_STORAGE = '@push_token';
const USER_ID_STORAGE = '@notification_user_id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const registerForPushNotifications = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE);
      const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE);
      
      if (storedToken) {
        setExpoPushToken(storedToken);
        console.log('Loaded stored push token:', storedToken);
      }
      
      if (storedUserId) {
        setUserId(storedUserId);
      }

      if (Platform.OS === 'web') {
        console.log('Push notifications not supported on web');
        setIsInitialized(true);
        return;
      }

      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        setIsInitialized(true);
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        setIsInitialized(true);
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      
      setExpoPushToken(token.data);
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE, token.data);
      console.log('Expo Push Token:', token.data);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);

  const setUserIdForNotifications = useCallback(async (newUserId: string) => {
    try {
      setUserId(newUserId);
      await AsyncStorage.setItem(USER_ID_STORAGE, newUserId);
      console.log('User ID set for notifications:', newUserId);
      
      if (expoPushToken) {
        console.log('Ready to send notifications to user:', newUserId, 'with token:', expoPushToken);
      }
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }, [expoPushToken]);

  return {
    expoPushToken,
    userId,
    isInitialized,
    setUserIdForNotifications,
  };
});
