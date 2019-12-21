import {
  Activity,
  ActivityCacheEvent,
  ActivityContent,
  ActivityRegistryFailure,
  ActivityTimedType
} from "../types/ActivityTypes";
import {RememberedPomodoro} from "../types/TacticalTypes";
import {BaseEvent, PayloadEvent} from "./Event";

export const STARTED_ACTIVITY = 'STARTED_ACTIVITY';
export const CACHED_ACTIVITY = 'CACHED_ACTIVITY';
export const SYNCED_ACTIVITIES = 'SYNCED_ACTIVITIES';
export const FOUND_PREVIOUS_ACTIVITY = 'FOUND_PREVIOUS_ACTIVITY';
export const STARTED_TIMED_ACTIVITY = 'STARTED_TIMED_ACTIVITY';
export const STARTED_NON_TIMED_ACTIVITY = 'STARTED_NON_TIMED_ACTIVITY';
export const RESUMED_TIMED_ACTIVITY = 'RESUMED_TIMED_ACTIVITY';
export const RESUMED_NON_TIMED_ACTIVITY = 'RESUMED_NON_TIMED_ACTIVITY';
export const REGISTERED_ACTIVITY_START = 'REGISTERED_ACTIVITY_START';
export const FAILED_TO_REGISTER_ACTIVITY_START = 'FAILED_TO_REGISTER_ACTIVITY_START';
export const INITIALIZED_CURRENT_ACTIVITY = 'INITIALIZED_CURRENT_ACTIVITY';

export const INITIALIZED_POMODORO = 'INITIALIZED_POMODORO';
export const COMPLETED_POMODORO = 'COMPLETED_POMODORO';

export const CAPSTONED_ACTIVITIES: 'CAPSTONED_ACTIVITIES' = 'CAPSTONED_ACTIVITIES';

export const createCapstoneActivitesEvent = (
    oldestActivity: Activity,
    newestActivity: Activity,
) => ({
    type: CAPSTONED_ACTIVITIES,
    payload: {
        oldestActivity,
        newestActivity,
    }
});

export const createCompletedPomodoroEvent = (): BaseEvent => ({
    type: COMPLETED_POMODORO,
});

export const createInitializedPomodoroEvent =
    (rememberedPomodoro: RememberedPomodoro): PayloadEvent<RememberedPomodoro> => ({
        type: INITIALIZED_POMODORO,
        payload: rememberedPomodoro,
    });

export const createStartedActivityEvent =
    (content: ActivityContent): PayloadEvent<Activity> => ({
        type: STARTED_ACTIVITY,
        payload: {
            antecedenceTime: new Date().getTime(),
            content
        }
    });

export const createStartedTimedActivityEvent =
    (content: ActivityContent): PayloadEvent<Activity> => ({
        type: STARTED_TIMED_ACTIVITY,
        payload: {
            antecedenceTime: new Date().getTime(),
            content
        }
    });

export const createStartedNonTimedActivityEvent =
    (content: ActivityContent): PayloadEvent<Activity> => ({
        type: STARTED_NON_TIMED_ACTIVITY,
        payload: {
            antecedenceTime: new Date().getTime(),
            content: {
                ...content,
                timedType: ActivityTimedType.NONE,
            },
        }
    });

export const createResumedStartedTimedActivityEvent =
    (activity: Activity): PayloadEvent<Activity> => ({
        type: RESUMED_TIMED_ACTIVITY,
        payload: activity
    });

export const createInitializedCurrentActivityEvent =
    (activity: Activity): PayloadEvent<Activity> => ({
        type: INITIALIZED_CURRENT_ACTIVITY,
        payload: activity
    });

export const createFoundPreviousActivityActivityEvent =
    (activity: Activity): PayloadEvent<Activity> => ({
        type: FOUND_PREVIOUS_ACTIVITY,
        payload: activity
    });

export const createResumedStartedNonTimedActivityEvent =
    (activity: Activity): PayloadEvent<Activity> => ({
        type: RESUMED_NON_TIMED_ACTIVITY,
        payload: activity
    });

export const createCachedActivityEvent =
    (activity: ActivityCacheEvent): PayloadEvent<ActivityCacheEvent> => ({
        type: CACHED_ACTIVITY,
        payload: activity
    });

export const createSyncedActivitiesEvent =
    (userGUID: string): PayloadEvent<string> => ({
        type: SYNCED_ACTIVITIES,
        payload: userGUID,
    });

export const createRegisteredStartEvent =
    (activity: Activity): PayloadEvent<Activity> => ({
        type: REGISTERED_ACTIVITY_START,
        payload: activity
    });

export const createFailureToRegisterStartEvent =
    (activityRegistryFailure: ActivityRegistryFailure): PayloadEvent<ActivityRegistryFailure> => ({
        type: FAILED_TO_REGISTER_ACTIVITY_START,
        payload: activityRegistryFailure
    });
