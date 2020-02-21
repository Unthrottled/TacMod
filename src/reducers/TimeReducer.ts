import {
  TIME_DECREMENTED,
  TIME_INCREMENTED,
  TIME_RESET,
  TIME_SET,
} from '../events/TimeEvents';

export interface TimeState {
  timeElapsed: number;
}

export const INITIAL_TIME_STATE: TimeState = {
  timeElapsed: 0,
};

export default (state: TimeState = INITIAL_TIME_STATE, action: any) => {
  switch (action.type) {
    case TIME_INCREMENTED:
      return {
        ...state,
        timeElapsed : state.timeElapsed + 1,
      };
    case TIME_DECREMENTED:
      return {
        ...state,
        timeElapsed : state.timeElapsed - 1,
      };
    case TIME_SET:
      return {
        ...state,
        timeElapsed: action.payload,
      };
    case TIME_RESET:
      return INITIAL_TIME_STATE;
    default:
      return state;
  }
};
