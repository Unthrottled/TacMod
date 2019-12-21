import {Objective, ObjectiveCacheEvent} from "../types/StrategyTypes";
import {BaseEvent, PayloadEvent} from "./Event";

export const VIEWED_OBJECTIVES: 'VIEWED_OBJECTIVES' = 'VIEWED_OBJECTIVES';
export const CREATED_OBJECTIVE: 'CREATED_OBJECTIVE' = 'CREATED_OBJECTIVE';
export const UPDATED_OBJECTIVE: 'UPDATED_OBJECTIVE' = 'UPDATED_OBJECTIVE';
export const DELETED_OBJECTIVE: 'DELETED_OBJECTIVE' = 'DELETED_OBJECTIVE';
export const COMPLETED_OBJECTIVE: 'COMPLETED_OBJECTIVE' = 'COMPLETED_OBJECTIVE';
export const SYNCED_OBJECTIVE: 'SYNCED_OBJECTIVE' = 'SYNCED_OBJECTIVE';
export const SYNCED_OBJECTIVES: 'SYNCED_OBJECTIVES' = 'SYNCED_OBJECTIVES';
export const CACHED_OBJECTIVE: 'CACHED_OBJECTIVE' = 'CACHED_OBJECTIVE';
export const FOUND_OBJECTIVES: 'FOUND_OBJECTIVES' = 'FOUND_OBJECTIVES';

export const createViewedObjectivesEvent =
    (): BaseEvent => ({
        type: VIEWED_OBJECTIVES,
    });

export const createCachedObjectiveEvent =
    (objectiveCacheEvent: ObjectiveCacheEvent): PayloadEvent<ObjectiveCacheEvent> => ({
        type: CACHED_OBJECTIVE,
        payload: objectiveCacheEvent
    });

export const createFetchedObjectivesEvent =
    (objectiveHistory: Objective[]): PayloadEvent<Objective[]> => ({
        type: FOUND_OBJECTIVES,
        payload: objectiveHistory
    });

export const createSyncedObjectiveEvent =
    (objective: Objective): PayloadEvent<Objective> => ({
        type: SYNCED_OBJECTIVE,
        payload: objective,
    });

export const createSyncedObjectivesEvent =
    (userGUID: string): PayloadEvent<string> => ({
        type: SYNCED_OBJECTIVES,
        payload: userGUID,
    });

export const createCreatedObjectiveEvent =
    (objective: Objective): PayloadEvent<Objective> => ({
        type: CREATED_OBJECTIVE,
        payload: objective,
    });

export const createUpdatedObjectiveEvent =
    (objective: Objective): PayloadEvent<Objective> => ({
        type: UPDATED_OBJECTIVE,
        payload: objective,
    });


export const createDeletedObjectiveEvent =
    (objective: Objective): PayloadEvent<Objective> => ({
        type: DELETED_OBJECTIVE,
        payload: objective,
    });

export const createCompletedObjectiveEvent =
    (objective: Objective): PayloadEvent<Objective> => ({
        type: COMPLETED_OBJECTIVE,
        payload: objective,
    });
