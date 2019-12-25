import {
  Activity,
  getActivityContent,
  getActivityName,
  isActivityRecovery,
} from '../../types/ActivityTypes';
import {PayloadEvent} from '../../events/Event';
import PushNotification from 'react-native-push-notification';
import BackgroundTimer from 'react-native-background-timer';
import {appStor} from '../../App';

export function activityNotificationSaga({payload}: PayloadEvent<Activity>) {
  BackgroundTimer.setTimeout(() => {
    appStor.dispatch({
      type: 'notify',
    });
    PushNotification.localNotification({
      message: 'My Notification Message',
    });
  }, 5000);
  // Notification.requestPermission().then(_ => {
  //   if ('Notification' in window && getActivityContent(payload).autoStart) {
  //     if (isActivityRecovery(payload)) {
  //       new Notification('Take a Break!', {
  //         icon: '/images/reach_orange_512.png',
  //       });
  //     } else {
  //       new Notification(`Get Back to ${getActivityName(payload)}!`, {
  //         icon: '/images/reach_orange_512.png',
  //       });
  //     }
  //     // audio.play().then(_ => {});
  //     try {
  //       window.navigator.vibrate([200, 100, 200]);
  //     } catch (_) {}
  //   }
  // });
}
