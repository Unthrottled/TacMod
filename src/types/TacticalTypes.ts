import {ColorType} from './StrategyTypes';
import {EventTypes} from './EventTypes';
import {ActivityStrategy, RECOVERY} from './ActivityTypes';
import {PomodoroState, TacticalActivityState,} from '../reducers/TacticalReducer';

export type TacticalState = {
  activity: TacticalActivityState;
  pomodoro: PomodoroState;
};

export interface RememberedPomodoro {
  dateCounted: number;
  count: number;
}

export interface PomodoroSettings {
  loadDuration: number; //milliseconds
  shortRecoveryDuration: number;
  longRecoveryDuration: number;
}

export interface CachedSettings {
  settings: PomodoroSettings;
}

export interface PomodoroSettingsRegistryFailure {
  error: any;
  settings: PomodoroSettings;
}

export const getActivityBackgroundColor = (
  tacticalActivity: TacticalActivity,
): string =>
  (tacticalActivity &&
    tacticalActivity.iconCustomization &&
    tacticalActivity.iconCustomization.background &&
    tacticalActivity.iconCustomization.background.hex) ||
  (tacticalActivity.name === RECOVERY && RECOVERY) ||
  ActivityStrategy.GENERIC;

export interface TacticalActivity {
  id: string;
  name: string;
  rank: number;
  antecedenceTime?: number;
  iconCustomization: {
    background: ColorType;
    line: ColorType;
  };
  categories: string[];
  hidden?: boolean;
}

export interface CachedTacticalActivity {
  uploadType: EventTypes;
  activity: TacticalActivity;
}

export interface TacticalActivityCacheEvent {
  cachedActivity: CachedTacticalActivity;
  userGUID: string;
}
