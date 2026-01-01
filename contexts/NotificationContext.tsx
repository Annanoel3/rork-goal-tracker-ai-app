import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const PUSH_TOKEN_STORAGE = '@push_token';
const USER_ID_STORAGE = '@notification_user_id';
const PLAYER_ID_STORAGE = '@onesignal_player_id';

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
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const registerForPushNotifications = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE);
      const storedPlayerId = await AsyncStorage.getItem(PLAYER_ID_STORAGE);
      const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE);
      
      if (storedToken) {
        setExpoPushToken(storedToken);
        console.log('Loaded stored push token:', storedToken);
      }

      if (storedPlayerId) {
        setPlayerId(storedPlayerId);
        console.log('Loaded stored player ID:', storedPlayerId);
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

      if (process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID) {
        await registerWithOneSignal(token.data, storedUserId);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setIsInitialized(true);
    }
  }, []);

  const registerWithOneSignal = async (pushToken: string, externalUserId?: string | null) => {
    try {
      const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) return;

      const deviceType = Platform.select({ ios: 0, android: 1, default: 1 });
      const body: any = {
        app_id: appId,
        device_type: deviceType,
        identifier: pushToken,
      };

      if (externalUserId) {
        body.external_user_id = externalUserId;
      }

      const response = await fetch('https://onesignal.com/api/v1/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (response.ok && result.id) {
        setPlayerId(result.id);
        await AsyncStorage.setItem(PLAYER_ID_STORAGE, result.id);
        console.log('OneSignal Player ID:', result.id);
      }
    } catch (error) {
      console.error('Error registering with OneSignal:', error);
    }
  };

  useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);

  const updatePlayerExternalUserId = useCallback(async (newUserId: string) => {
    if (!playerId || !process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID) {
      console.log('Cannot update external user ID - player not registered');
      return false;
    }

    try {
      const response = await fetch(`https://onesignal.com/api/v1/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
          external_user_id: newUserId,
        }),
      });
      
      const result = await response.json();
      console.log('OneSignal external user ID update result:', result);
      return response.ok;
    } catch (error) {
      console.error('Error updating external user ID:', error);
      return false;
    }
  }, [playerId]);

  const setUserIdForNotifications = useCallback(async (newUserId: string) => {
    try {
      setUserId(newUserId);
      await AsyncStorage.setItem(USER_ID_STORAGE, newUserId);
      console.log('User ID set for notifications:', newUserId);
      
      if (playerId && process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID) {
        const response = await fetch(`https://onesignal.com/api/v1/players/${playerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_id: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
            external_user_id: newUserId,
          }),
        });
        
        if (response.ok) {
          console.log('OneSignal external user ID updated:', newUserId);
        }
      }
      
      if (expoPushToken || playerId) {
        console.log('Ready to send notifications to user:', newUserId, 
          'token:', expoPushToken, 'playerId:', playerId);
      }
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }, [expoPushToken, playerId]);

  return {
    expoPushToken,
    playerId,
    userId,
    isInitialized,
    setUserIdForNotifications,
    updatePlayerExternalUserId,
  };
});
