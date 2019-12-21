import {
  Activity,
  ActivityStrategy,
  getActivityID,
  getActivityName,
  isActivityRecovery,
  RECOVERY
} from "../types/ActivityTypes";
import {LOGGED_OFF, LOGGED_ON} from "../events/SecurityEvents";


export const haveSameDefaultName = (currentActivity: Activity, nextActivity: Activity): boolean => {
  const activityName = getActivityName(currentActivity);
  const haveSameName = activityName === getActivityName(nextActivity);
  return haveSameName &&
    (activityName === RECOVERY || activityName === ActivityStrategy.GENERIC);
};

export const haveSameDefinedId = (currentActivity: Activity, nextActivity: Activity): boolean => {
  const currentActivityIdentifier = getActivityIdentifier(currentActivity);
  const haveSameId = currentActivityIdentifier === getActivityIdentifier(nextActivity);
  return haveSameId && !!currentActivityIdentifier;
};

export const areDifferent = (currentActivity: Activity, nextActivity: Activity): boolean => {
  return !(haveSameDefinedId(currentActivity, nextActivity) ||
    haveSameDefaultName(currentActivity, nextActivity));
};

export const shouldTime = (activity: Activity): boolean => {
  const activityName = getActivityName(activity);
  switch (activityName) {
    case LOGGED_ON:
    case LOGGED_OFF:
      return false;
    default:
      return true;

  }
};

export const getActivityIdentifier = (currentActivity: Activity) =>
  isActivityRecovery(currentActivity) ? RECOVERY : getActivityID(currentActivity);
