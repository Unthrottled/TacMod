import {
  CACHED_ACTIVITY,
  COMPLETED_POMODORO,
  FOUND_PREVIOUS_ACTIVITY,
  INITIALIZED_POMODORO,
  RESUMED_NON_TIMED_ACTIVITY,
  RESUMED_TIMED_ACTIVITY,
  STARTED_NON_TIMED_ACTIVITY,
  STARTED_TIMED_ACTIVITY,
  SYNCED_ACTIVITIES,
} from '../events/ActivityEvents';
import {objectToKeyValueArray} from '../miscellanous/Tools';
import {
  Activity,
  ActivityTimedType,
  ActivityType,
  CachedActivity,
} from '../types/ActivityTypes';
import {StringDictionary} from '../types/BaseTypes';
import reduceRight from 'lodash/reduceRight';
import {LOGGED_OFF} from '../events/SecurityEvents';

export type RememberedPomodoro = {
  dateCounted: number;
  count: number;
};

export type ActivityState = {
  shouldTime: boolean;
  currentActivity: Activity;
  previousActivity: Activity;
  completedPomodoro: RememberedPomodoro;
  cache: StringDictionary<CachedActivity[]>;
};

export const defaultActivity = {
  antecedenceTime: 0,
  content: {
    uuid: '',
    name: '',
    timedType: ActivityTimedType.NONE,
    type: ActivityType.PASSIVE,
    paused: false,
    autoStart: false,
  },
};
export const INITIAL_ACTIVITY_STATE: ActivityState = {
  shouldTime: false,
  currentActivity: defaultActivity,
  previousActivity: defaultActivity,
  completedPomodoro: {
    dateCounted: 0,
    count: 0,
  },
  cache: {},
};

const activityReducer = (
  state: ActivityState = INITIAL_ACTIVITY_STATE,
  action: any,
): ActivityState => {
  switch (action.type) {
    case LOGGED_OFF:
      return {
        ...INITIAL_ACTIVITY_STATE,
        cache: state.cache,
      };
    case INITIALIZED_POMODORO:
      return {
        ...state,
        completedPomodoro: action.payload,
      };
    case COMPLETED_POMODORO:
      return {
        ...state,
        completedPomodoro: {
          ...state.completedPomodoro,
          count: state.completedPomodoro.count + 1,
        },
      };
    case STARTED_TIMED_ACTIVITY:
    case RESUMED_TIMED_ACTIVITY:
      return {
        ...state,
        shouldTime: true,
        previousActivity: state.currentActivity.antecedenceTime
          ? state.currentActivity
          : state.previousActivity,
        currentActivity: action.payload,
      };
    case STARTED_NON_TIMED_ACTIVITY:
    case RESUMED_NON_TIMED_ACTIVITY:
      return {
        ...state,
        shouldTime: false,
        previousActivity: state.currentActivity.antecedenceTime
          ? state.currentActivity
          : state.previousActivity,
        currentActivity: action.payload,
      };
    case FOUND_PREVIOUS_ACTIVITY:
      return {
        ...state,
        previousActivity: action.payload,
      };
    case CACHED_ACTIVITY: {
      const {userGUID, cachedActivity} = action.payload;
      if (state.cache[userGUID]) {
        state.cache[userGUID].push(cachedActivity);
      } else {
        state.cache[userGUID] = [cachedActivity];
      }
      return {
        ...state,
        cache: {
          ...state.cache,
        },
      };
    }
    case SYNCED_ACTIVITIES: {
      return {
        ...state,
        cache: {
          ...reduceRight(
            objectToKeyValueArray(state.cache).filter(
              keyValues => keyValues.key !== action.payload,
            ),
            (accum: StringDictionary<CachedActivity[]>, keyValue) => {
              accum[keyValue.key] = keyValue.value;
              return accum;
            },
            {},
          ),
        },
      };
    }
    default:
      return state;
  }
};

export default activityReducer;
