declare module 'react-native-alarm-notification' {
  function parseDate(date: Date): string;

  function scheduleAlarm(param: any): void;

  function sendNotification(param: any): void;

  function cancelAllNotifications(): void;

  function stopAlarm(): void;
}
