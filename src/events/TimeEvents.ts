import {BaseEvent, PayloadEvent} from "./Event";

export const TIME_INCREMENTED: 'TIME_INCREMENTED' = 'TIME_INCREMENTED';
export const TIME_DECREMENTED: 'TIME_DECREMENTED' = 'TIME_DECREMENTED';
export const TIME_SET: 'TIME_SET' = 'TIME_SET';
export const TIME_RESET: 'TIME_RESET' = 'TIME_RESET';

export const createTimeIncrementEvent = (): BaseEvent => ({
  type: TIME_INCREMENTED,
});

export const createTimeDecrementEvent = (): BaseEvent => ({
  type: TIME_DECREMENTED,
});

export const createTimeSetEvent = (timeToSet: number): PayloadEvent<number> => ({
  type: TIME_SET,
  payload: timeToSet,
});

export const createTimeResetEvent = (): BaseEvent => ({
  type: TIME_RESET,
});
