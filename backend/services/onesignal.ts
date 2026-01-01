interface PushNotification {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const notification: PushNotification = {
    to: expoPushToken,
    title,
    body: message,
    data: data || {},
    sound: 'default',
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('Expo push notification error:', result);
    throw new Error(`Failed to send notification: ${JSON.stringify(result)}`);
  }

  console.log('Push notification sent:', result);
  return result;
}

export async function sendPushNotifications(
  expoPushTokens: string[],
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const notifications = expoPushTokens.map(token => ({
    to: token,
    title,
    body: message,
    data: data || {},
    sound: 'default',
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notifications),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('Expo push notification error:', result);
    throw new Error(`Failed to send notifications: ${JSON.stringify(result)}`);
  }

  console.log('Push notifications sent:', result);
  return result;
}
