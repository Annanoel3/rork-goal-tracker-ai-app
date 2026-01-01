const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
  console.error('OneSignal environment variables not set');
}

export async function sendNotificationToPlayer(
  playerId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    throw new Error('OneSignal not configured');
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: message },
      data: data || {},
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal error:', result);
    throw new Error(`Failed to send notification: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notification sent:', result);
  return result;
}

export async function sendNotificationToPlayers(
  playerIds: string[],
  title: string,
  message: string,
  data?: Record<string, any>
) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    throw new Error('OneSignal not configured');
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      headings: { en: title },
      contents: { en: message },
      data: data || {},
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('OneSignal error:', result);
    throw new Error(`Failed to send notification: ${JSON.stringify(result)}`);
  }

  console.log('OneSignal notification sent:', result);
  return result;
}
