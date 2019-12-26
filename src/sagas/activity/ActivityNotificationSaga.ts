import {
  Activity,
  getActivityContent,
  getActivityName,
  isActivityRecovery,
} from '../../types/ActivityTypes';
import {PayloadEvent} from '../../events/Event';
import PushNotification from 'react-native-push-notification';
import {Vibration} from 'react-native';

export function activityNotificationSaga({payload}: PayloadEvent<Activity>) {
  const getMessage = () => {
    if (isActivityRecovery(payload)) {
      return 'Take a Break!';
    } else {
      return `Get Back to ${getActivityName(payload)}!`;
    }
  };

  if (getActivityContent(payload).autoStart) {
    PushNotification.localNotification({
      message: getMessage(),
    });
    Vibration.vibrate([200, 100, 200]);
  }
}
