import {Activity} from "../types/ActivityTypes";
import {DateRange} from "../types/HistoryTypes";
import {BaseEvent, PayloadEvent} from "./Event";

export const UPDATED_HISTORY_SELECTION: 'UPDATED_HISTORY_SELECTION' = 'UPDATED_HISTORY_SELECTION';
export const UPDATED_FULL_FEED: 'UPDATED_FULL_FEED' = 'UPDATED_FULL_FEED';
export const INITIALIZED_HISTORY: 'INITIALIZED_HISTORY' = 'INITIALIZED_HISTORY';
export const FOUND_BEFORE_CAPSTONE: 'FOUND_BEFORE_CAPSTONE' = 'FOUND_BEFORE_CAPSTONE';
export const FOUND_AFTER_CAPSTONE: 'FOUND_AFTER_CAPSTONE' = 'FOUND_AFTER_CAPSTONE';
export const UPDATED_CAPSTONES: 'UPDATED_CAPSTONES' = 'UPDATED_CAPSTONES';
export const UPDATED_HISTORY: 'UPDATED_HISTORY' = 'UPDATED_HISTORY';
export const VIEWED_HISTORY: 'VIEWED_HISTORY' = 'VIEWED_HISTORY';
export const ADJUSTED_HISTORY: 'ADJUSTED_HISTORY' = 'ADJUSTED_HISTORY';

export interface ActivityReceptionPayload {
    activities: Activity[];
    between: DateRange;
}

export interface CapstoneActivityUpdatePayload {
    beforeCapstone: Activity;
    afterCapstone: Activity;
}

export interface ActivityUpdatePayload {
    selection: ActivityReceptionPayload;
    full: ActivityReceptionPayload;
}


export const createViewedHistoryEvent =
    (): BaseEvent => ({
        type: VIEWED_HISTORY,
    });

export const createInitializedHistoryEvent =
    (activityUpdate: ActivityUpdatePayload): PayloadEvent<ActivityUpdatePayload> => ({
        type: INITIALIZED_HISTORY,
        payload: activityUpdate,
    });

export const createUpdatedHistoryEvent =
    (activityUpdate: ActivityUpdatePayload): PayloadEvent<ActivityUpdatePayload> => ({
        type: UPDATED_HISTORY,
        payload: activityUpdate,
    });

export const createFoundBeforeCapstoneEvent =
    (capstoneActivity: Activity): PayloadEvent<Activity> => ({
        type: FOUND_BEFORE_CAPSTONE,
        payload: capstoneActivity,
    });

export const createFoundAfterCapstoneEvent =
    (capstoneActivity: Activity): PayloadEvent<Activity> => ({
        type: FOUND_AFTER_CAPSTONE,
        payload: capstoneActivity,
    });

export const createUpdatedCapstonesEvent =
    (capstoneActivityUpdatePayload: CapstoneActivityUpdatePayload): PayloadEvent<CapstoneActivityUpdatePayload> => ({
        type: UPDATED_CAPSTONES,
        payload: capstoneActivityUpdatePayload,
    });

export const createUpdatedHistorySelectionEvent =
    (activityUpdate: ActivityReceptionPayload): PayloadEvent<ActivityReceptionPayload> => ({
        type: UPDATED_HISTORY_SELECTION,
        payload: activityUpdate,
    });

export const createUpdatedFullFeedEvent =
    (activityUpdate: ActivityReceptionPayload): PayloadEvent<ActivityReceptionPayload> => ({
        type: UPDATED_FULL_FEED,
        payload: activityUpdate,
    });

export const createAdjustedHistoryTimeFrame =
    (dateRange: DateRange): PayloadEvent<DateRange> => ({
        type: ADJUSTED_HISTORY,
        payload: dateRange
    });

