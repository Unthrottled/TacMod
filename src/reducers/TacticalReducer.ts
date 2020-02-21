import {
  CachedTacticalActivity,
  PomodoroSettings,
  TacticalActivity,
  TacticalState,
} from '../types/TacticalTypes';
import {
  CACHED_SETTINGS,
  FOUND_POMODORO_SETTINGS,
  REGISTERED_POMODORO_SETTINGS,
  SettingsCacheEvent,
  SYNCED_SETTINGS,
  UPDATED_POMODORO_SETTINGS,
} from '../events/TacticalEvents';
import {objectToKeyValueArray} from '../miscellanous/Tools';
import TacticalActivityReducer from './TacticalActivityReducer';
import {NumberDictionary, StringDictionary} from '../types/BaseTypes';
import {LOGGED_OFF} from '../events/SecurityEvents';

export interface PomodoroState {
  settings: PomodoroSettings;
  cache: StringDictionary<SettingsCacheEvent>;
}

export interface TacticalActivityState {
  activities: NumberDictionary<TacticalActivity>;
  archivedActivities: StringDictionary<TacticalActivity>;
  cache: StringDictionary<CachedTacticalActivity[]>;
}

export const INITIAL_TACTICAL_STATE: TacticalState = {
  pomodoro: {
    settings: {
      loadDuration: 1620000, //milliseconds
      shortRecoveryDuration: 180000,
      longRecoveryDuration: 2400000,
    },
    cache: {},
  },
  activity: {
    activities: {},
    archivedActivities: {},
    cache: {},
  },
};

const TacticalReducer = (
  state: TacticalState = INITIAL_TACTICAL_STATE,
  action: any,
) => {
  const updatedState = TacticalActivityReducer(state, action);
  switch (action.type) {
    case LOGGED_OFF:
      return {
        pomodoro: {
          ...INITIAL_TACTICAL_STATE.pomodoro,
          cache: state.pomodoro.cache,
        },
        activity: {
          ...INITIAL_TACTICAL_STATE.activity,
          cache: state.activity.cache,
        },
      };
    case UPDATED_POMODORO_SETTINGS:
    case FOUND_POMODORO_SETTINGS:
    case REGISTERED_POMODORO_SETTINGS:
      return {
        ...updatedState,
        pomodoro: {
          ...state.pomodoro,
          settings: {
            ...state.pomodoro.settings,
            ...action.payload,
          },
        },
      };
    case CACHED_SETTINGS: {
      const {userGUID, cachedSettings} = action.payload;
      updatedState.pomodoro.cache[userGUID] = cachedSettings;
      return {
        ...updatedState,
        pomodoro: {
          ...updatedState.pomodoro,
        },
      };
    }
    case SYNCED_SETTINGS: {
      return {
        ...updatedState,
        pomodoro: {
          ...updatedState.pomodoro,
          cache: {
            ...objectToKeyValueArray(updatedState.pomodoro.cache)
              .filter(keyValues => keyValues.key !== action.payload)
              .reduce(
                (accum: StringDictionary<SettingsCacheEvent>, keyValue) => {
                  accum[keyValue.key] = keyValue.value;
                  return accum;
                },
                {},
              ),
          },
        },
      };
    }
    default:
      return updatedState;
  }
};

export default TacticalReducer;
