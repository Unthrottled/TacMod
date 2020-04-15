import {FOUND_INTERNET, FOUND_WIFI, LOST_INTERNET, LOST_WIFI,} from '../events/NetworkEvents';

export interface NetworkState {
  isOnline: boolean;
  hasInternet: boolean;
}

export const INITIAL_NETWORK_STATE: NetworkState = {
  isOnline: false,
  hasInternet: false,
};

const networkReducer = (
  state: NetworkState = INITIAL_NETWORK_STATE,
  action: any,
) => {
  switch (action.type) {
    case FOUND_WIFI:
      return {
        ...state,
        isOnline: true,
      };
    case FOUND_INTERNET:
      return {
        ...state,
        hasInternet: true,
      };
    case LOST_WIFI:
      return {
        ...state,
        isOnline: false,
      };
    case LOST_INTERNET:
      return {
        ...state,
        hasInternet: false,
      };
    default:
      return state;
  }
};

export default networkReducer;
