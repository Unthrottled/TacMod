import {BaseEvent, PayloadEvent} from "./Event";

export const REQUESTED_NOTIFICATION: 'REQUESTED_NOTIFICATION' = 'REQUESTED_NOTIFICATION';
export const DISMISSED_NOTIFICATION: 'DISMISSED_NOTIFICATION' = 'DISMISSED_NOTIFICATION';
export const SAVED_REDIRECT: 'SAVED_REDIRECT' = 'SAVED_REDIRECT';

export const createHideNotificationEvent = (): BaseEvent => ({
    type: DISMISSED_NOTIFICATION,
});

export const createShowWarningNotificationEvent = (message: string): PayloadEvent<String> => ({
    type: REQUESTED_NOTIFICATION,
    payload: message,
});

export const createSaveRedirect = (redirectPath: string): PayloadEvent<String> => ({
    type: SAVED_REDIRECT,
    payload: redirectPath,
});

