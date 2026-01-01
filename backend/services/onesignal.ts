const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

interface OneSignalNotification {
  app_id: string;
  contents: { en: string };
  headings: { en: string };
  data?: Record<string, any>;
  include_player_ids?: string[];
  include_external_user_ids?: string[];
  include_aliases?: {
    external_id?: string[];
  };
}

function getOneSignalHeaders() {
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!apiKey) {
    throw new Error('ONESIGNAL_REST_API_KEY not configured');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`,
  };
}

export async function sendNotificationToPlayer(
  playerId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    throw new Error('EXPO_PUBLIC_ONESIGNAL_APP_ID not configured');
  }

  const notification: OneSignalNotification = {
    app_id: appId,
    contents: { en: message },
    headings: { en: title },
    include_player_ids: [playerId],
    data: data || {},
  };

  const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
    method: 'POST',
    headers: getOneSignalHeaders(),
    body: JSON.stringify(notification),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal notification error:', result);
    throw new Error(`Failed to send notification: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notification sent to player:', playerId, result);
  return result;
}

export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    throw new Error('EXPO_PUBLIC_ONESIGNAL_APP_ID not configured');
  }

  const notification: OneSignalNotification = {
    app_id: appId,
    contents: { en: message },
    headings: { en: title },
    include_aliases: {
      external_id: [userId],
    },
    data: data || {},
  };

  const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
    method: 'POST',
    headers: getOneSignalHeaders(),
    body: JSON.stringify(notification),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal notification error:', result);
    throw new Error(`Failed to send notification: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notification sent to user:', userId, result);
  return result;
}

export async function sendNotificationToPlayers(
  playerIds: string[],
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    throw new Error('EXPO_PUBLIC_ONESIGNAL_APP_ID not configured');
  }

  const notification: OneSignalNotification = {
    app_id: appId,
    contents: { en: message },
    headings: { en: title },
    include_player_ids: playerIds,
    data: data || {},
  };

  const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
    method: 'POST',
    headers: getOneSignalHeaders(),
    body: JSON.stringify(notification),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal notification error:', result);
    throw new Error(`Failed to send notifications: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notifications sent to players:', playerIds.length, result);
  return result;
}

export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    throw new Error('EXPO_PUBLIC_ONESIGNAL_APP_ID not configured');
  }

  const notification: OneSignalNotification = {
    app_id: appId,
    contents: { en: message },
    headings: { en: title },
    include_aliases: {
      external_id: userIds,
    },
    data: data || {},
  };

  const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
    method: 'POST',
    headers: getOneSignalHeaders(),
    body: JSON.stringify(notification),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal notification error:', result);
    throw new Error(`Failed to send notifications: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notifications sent to users:', userIds.length, result);
  return result;
}
