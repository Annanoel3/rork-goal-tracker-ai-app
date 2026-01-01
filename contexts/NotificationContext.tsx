import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_ID_STORAGE = '@onesignal_player_id';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeOneSignal = useCallback(async () => {
    try {
      const storedPlayerId = await AsyncStorage.getItem(PLAYER_ID_STORAGE);
      if (storedPlayerId) {
        setPlayerId(storedPlayerId);
        console.log('Loaded stored OneSignal player ID:', storedPlayerId);
      }

      if (!ONESIGNAL_APP_ID) {
        console.error('OneSignal App ID not configured');
        return;
      }

      if (Platform.OS === 'web') {
        console.log('OneSignal: Web platform detected');
        await initializeOneSignalWeb();
      } else {
        console.log('OneSignal: Native platform, using REST API only');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }, []);

  useEffect(() => {
    initializeOneSignal();
  }, [initializeOneSignal]);

  const initializeOneSignalWeb = async () => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    script.onload = async () => {
      try {
        const OneSignal = (window as any).OneSignal;
        if (!OneSignal) return;

        await OneSignal.init({ appId: ONESIGNAL_APP_ID });
        
        OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
          console.log('OneSignal subscription changed:', event);
          if (event.current.id) {
            setPlayerId(event.current.id);
            AsyncStorage.setItem(PLAYER_ID_STORAGE, event.current.id);
            console.log('OneSignal Player ID:', event.current.id);
          }
        });

        const userId = await OneSignal.User.getExternalId();
        if (userId) {
          setPlayerId(userId);
          await AsyncStorage.setItem(PLAYER_ID_STORAGE, userId);
        }
      } catch (error) {
        console.error('Error initializing OneSignal Web SDK:', error);
      }
    };
  };

  const setExternalUserId = async (userId: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const OneSignal = (window as any).OneSignal;
        if (OneSignal) {
          await OneSignal.login(userId);
          console.log('OneSignal external user ID set:', userId);
        }
      }
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  };

  return {
    playerId,
    isInitialized,
    setExternalUserId,
  };
});
