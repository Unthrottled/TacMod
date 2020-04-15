import {EventTypes} from './EventTypes';

export enum ActivityType {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  NA = 'NA',
}

export enum ActivityStrategy {
  GENERIC = 'GENERIC',
}

export enum ActivityTimedType {
  NA = 'NA',
  NONE = 'NONE',
  TIMER = 'TIMER',
  STOP_WATCH = 'STOP_WATCH',
}

export interface ActivityCacheEvent {
  cachedActivity: CachedActivity;
  userGUID: string;
}

export interface ActivityContent {
  uuid: string;
  name: string;
  timedType: ActivityTimedType;
  type: ActivityType;
  paused?: boolean;
  autoStart?: boolean;
  veryFirstActivity?: boolean;
  activityID?: string;
  duration?: number;
  workStartedWomboCombo?: number;
  nativeManaged?: boolean;
}

export interface Activity {
  antecedenceTime: number;
  content: ActivityContent;
}

export const DEFAULT_ACTIVITY: Activity = {
  antecedenceTime: 0,
  content: {
    uuid: '',
    name: '',
    timedType: ActivityTimedType.NA,
    type: ActivityType.NA,
  },
};

export interface CachedActivity {
  uploadType: EventTypes.CREATED | EventTypes.UPDATED | EventTypes.DELETED;
  activity: Activity;
}

export interface ActivityRegistryFailure {
  error: any;
  activity: Activity;
}

export const RECOVERY = 'RECOVERY';

export const getActivityContent = (activity: Activity): ActivityContent =>
  (activity && activity.content) || {};
export const getTimedType = (activity: Activity) =>
  getActivityContent(activity).timedType || ActivityTimedType.NONE;
export const getActivityType = (activity: Activity) =>
  getActivityContent(activity).type || ActivityType.PASSIVE;
export const getActivityName = (activity: Activity) =>
  getActivityContent(activity).name;
export const isPausedActivity = (activity: Activity) =>
  getActivityContent(activity).paused;
export const getActivityID = (activity: Activity) =>
  getActivityContent(activity).activityID ||
  (isActivityRecovery(activity) && RECOVERY) ||
  ActivityStrategy.GENERIC;
const getId = (activity: Activity) => getActivityContent(activity).uuid;

export const activitiesEqual = (
  currentActivity: Activity,
  activity: Activity,
) => {
  const activityOneId = getId(currentActivity);
  return activityOneId === getId(activity) && !!activityOneId;
};
export const isActivityRecovery = (activity: Activity) =>
  activity && activity.content && activity.content.name === RECOVERY;
