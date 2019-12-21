import {
  PomodoroSettings,
  PomodoroSettingsRegistryFailure,
  TacticalActivity,
  TacticalActivityCacheEvent
} from "../types/TacticalTypes";
import {BaseEvent, PayloadEvent} from "./Event";

export const CREATED_ACTIVITY: 'CREATED_ACTIVITY' = 'CREATED_ACTIVITY';
export const UPDATED_ACTIVITY: 'UPDATED_ACTIVITY' = 'UPDATED_ACTIVITY';
export const DELETED_ACTIVITY: 'DELETED_ACTIVITY' = 'DELETED_ACTIVITY';
export const REQUESTED_ACTIVITY_DELETION: 'REQUESTED_ACTIVITY_DELETION' = 'REQUESTED_ACTIVITY_DELETION';
export const HID_ACTIVITY: 'HID_ACTIVITY' = 'HID_ACTIVITY';
export const UNHID_ACTIVITY: 'UNHID_ACTIVITY' = 'UNHID_ACTIVITY';
export const FOUND_ACTIVITIES: 'FOUND_ACTIVITIES' = 'FOUND_ACTIVITIES';
export const RESTORED_ACTIVITY: 'RESTORED_ACTIVITY' = 'RESTORED_ACTIVITY';
export const REPLACE_ACTIVITIES: 'REPLACE_ACTIVITIES' = 'REPLACE_ACTIVITIES';
export const ARCHIVED_ACTIVITY: 'ARCHIVED_ACTIVITY' = 'ARCHIVED_ACTIVITY';
export const RANKED_ACTIVITIES: 'RANKED_ACTIVITIES' = 'RANKED_ACTIVITIES';
export const CACHED_TACTICAL_ACTIVITY: 'CACHED_TACTICAL_ACTIVITY' = 'CACHED_TACTICAL_ACTIVITY';
export const VIEWED_ACTIVITIES: 'VIEWED_ACTIVITIES' = 'VIEWED_ACTIVITIES';
export const SYNCED_TACTICAL_ACTIVITIES: 'SYNCED_TACTICAL_ACTIVITIES' = 'SYNCED_TACTICAL_ACTIVITIES';
export const SYNCED_TACTICAL_ACTIVITY: 'SYNCED_TACTICAL_ACTIVITY' = 'SYNCED_TACTICAL_ACTIVITY';

export const UPDATED_POMODORO_SETTINGS: 'UPDATED_POMODORO_SETTINGS' = 'UPDATED_POMODORO_SETTINGS';
export const FOUND_POMODORO_SETTINGS: 'FOUND_POMODORO_SETTINGS' = 'FOUND_POMODORO_SETTINGS';
export const CACHED_SETTINGS: 'CACHED_SETTINGS' = 'CACHED_SETTINGS';
export const VIEWED_SETTINGS: 'VIEWED_SETTINGS' = 'VIEWED_SETTINGS';
export const SYNCED_SETTINGS: 'SYNCED_SETTINGS' = 'SYNCED_SETTINGS';
export const REGISTERED_POMODORO_SETTINGS: 'REGISTERED_POMODORO_SETTINGS' = 'REGISTERED_POMODORO_SETTINGS';
export const FAILED_TO_REGISTER_POMODORO_SETTINGS: 'FAILED_TO_REGISTER_POMODORO_SETTINGS' = 'FAILED_TO_REGISTER_POMODORO_SETTINGS';

export interface SettingsCacheEvent {
    cachedSettings: PomodoroSettings;
    userGUID: string;
}

export const createUpdatedPomodoroSettingsEvent =
    (pomodoroSettings: PomodoroSettings): PayloadEvent<PomodoroSettings> => ({
        type: UPDATED_POMODORO_SETTINGS,
        payload: pomodoroSettings,
    });

export const createFoundPomodoroSettingsEvent =
    (pomodoroSettings: PomodoroSettings): PayloadEvent<PomodoroSettings> => ({
        type: FOUND_POMODORO_SETTINGS,
        payload: pomodoroSettings,
    });

export const createViewedSettingsEvent =
    (): BaseEvent =>
        ({
            type: VIEWED_SETTINGS,
        });

export const createCachedSettingsEvent =
    (cachedSettings: SettingsCacheEvent): PayloadEvent<SettingsCacheEvent> => ({
        type: CACHED_SETTINGS,
        payload: cachedSettings
    });

export const createSyncedSettingsEvent =

    (userGUID: string): PayloadEvent<String> => ({
        type: SYNCED_SETTINGS,
        payload: userGUID,
    });

export const createRegisteredPomodoroSettingsEvent =

    (pomodoroSettings: PomodoroSettings): PayloadEvent<PomodoroSettings> => ({
        type: REGISTERED_POMODORO_SETTINGS,
        payload: pomodoroSettings
    });

export const createFailureToRegisterPomodoroSettingsEvent =
    (
        pomodoroSettingsRegistryFailure: PomodoroSettingsRegistryFailure
    ): PayloadEvent<PomodoroSettingsRegistryFailure> => ({
        type: FAILED_TO_REGISTER_POMODORO_SETTINGS,
        payload: pomodoroSettingsRegistryFailure
    });

export const createViewedTacticalActivitesEvent =
    (): BaseEvent =>
        ({
            type: VIEWED_ACTIVITIES,
        });

export const createCachedTacticalActivityEvent =
    (
        tacticalActivityCacheEvent: TacticalActivityCacheEvent
    ): PayloadEvent<TacticalActivityCacheEvent> => ({
        type: CACHED_TACTICAL_ACTIVITY,
        payload: tacticalActivityCacheEvent
    });

export const createFetchedTacticalActivitesEvent =
    (tacticalActivityHistory: TacticalActivity[]): PayloadEvent<TacticalActivity[]> => ({
        type: FOUND_ACTIVITIES,
        payload: tacticalActivityHistory
    });

export const createReplaceActiveActivitesEvent =
    (tacticalActivityHistory: TacticalActivity[]): PayloadEvent<TacticalActivity[]> => ({
        type: REPLACE_ACTIVITIES,
        payload: tacticalActivityHistory
    });

export const createReRankedTacticalActivitiesEvent =
    (tacticalActivityHistory: TacticalActivity[]): PayloadEvent<TacticalActivity[]> => ({
        type: RANKED_ACTIVITIES,
        payload: tacticalActivityHistory
    });

export const createSyncedTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: SYNCED_TACTICAL_ACTIVITY,
        payload: tacticalActivity,
    });

export const createSyncedTacticalActivitiesEvent =
    (userGUID: string): PayloadEvent<string> => ({
        type: SYNCED_TACTICAL_ACTIVITIES,
        payload: userGUID,
    });

export const createCreatedTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: CREATED_ACTIVITY,
        payload: tacticalActivity,
    });

export const createUpdatedTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: UPDATED_ACTIVITY,
        payload: tacticalActivity,
    });

export const createDeletedTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: DELETED_ACTIVITY,
        payload: tacticalActivity,
    });

export const createRequestToDeleteTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: REQUESTED_ACTIVITY_DELETION,
        payload: tacticalActivity,
    });

export const createHideTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: HID_ACTIVITY,
        payload: tacticalActivity,
    });

export const createArchivedTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: ARCHIVED_ACTIVITY,
        payload: tacticalActivity,
    });

export const createRestoredTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: RESTORED_ACTIVITY,
        payload: tacticalActivity,
    });

export const createShowTacticalActivityEvent =
    (tacticalActivity: TacticalActivity): PayloadEvent<TacticalActivity> => ({
        type: UNHID_ACTIVITY,
        payload: tacticalActivity,
    });
