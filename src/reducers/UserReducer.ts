import {CHECKED_CACHES, RECEIVED_USER} from '../events/UserEvents';
import {LOGGED_OFF} from '../events/SecurityEvents';
import {User} from '../types/UserTypes';

export type UserMiscellaneous = {
  hasItemsCached: boolean;
};

export type UserState = {
  information: User;
  miscellaneous: UserMiscellaneous;
};
const INITIAL_USER_STATE: UserState = {
  information: {
    firstName: '',
    lastName: '',
    email: '',
    fullName: '',
    guid: '',
    userName: '',
  },
  miscellaneous: {
    hasItemsCached: false,
  },
};

const userReducer = (state: UserState = INITIAL_USER_STATE, action: any) => {
  switch (action.type) {
    case RECEIVED_USER:
      return {
        ...state,
        information: {
          ...state.information,
          ...action.payload.information,
        },
      };
    case LOGGED_OFF: {
      return INITIAL_USER_STATE;
    }
    case CHECKED_CACHES: {
      return {
        ...state,
        miscellaneous: {
          ...state.miscellaneous,
          hasItemsCached: action.payload,
        },
      };
    }

    default:
      return state;
  }
};

export default userReducer;
