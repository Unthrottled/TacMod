import {BaseEvent} from "./Event";

export const FOUND_WIFI: 'FOUND_WIFI' = 'FOUND_WIFI';
export const LOST_WIFI: 'LOST_WIFI' = 'LOST_WIFI';
export const FOUND_INTERNET: 'FOUND_INTERNET' = 'FOUND_INTERNET';
export const LOST_INTERNET: 'LOST_INTERNET' = 'LOST_INTERNET';

export const createFoundWifiEvent = (): BaseEvent => ({
    type: FOUND_WIFI,
});
export const createLostWifiEvent = (): BaseEvent => ({
    type: LOST_WIFI,
});

export const createFoundInternetEvent = (): BaseEvent => ({
    type: FOUND_INTERNET,
});
export const createLostInternetEvent = (): BaseEvent => ({
    type: LOST_INTERNET,
});
