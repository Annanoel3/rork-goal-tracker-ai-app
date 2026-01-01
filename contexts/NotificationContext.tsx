import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Subscription } from 'expo-notifications';

const PUSH_TOKEN_STORAGE = '@push_token';

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
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Subscription | undefined>(undefined);
  const responseListener = useRef<Subscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE);
      if (storedToken) {
        setExpoPushToken(storedToken);
        console.log('Loaded stored push token:', storedToken);
      }

      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notifications');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      const token = tokenData.data;
      
      setExpoPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE, token);
      console.log('Push token registered:', token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, seconds: number = 1) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
      });
      console.log('Local notification scheduled');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    scheduleLocalNotification,
  };
});
