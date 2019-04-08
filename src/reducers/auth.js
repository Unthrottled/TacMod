import {LOGIN, LOGOUT} from 'actions';
import {INITIAL_STATE} from "./index";

const AuthReducer = (state = INITIAL_STATE.security, action) => {
  switch (action.type) {
    case LOGIN:
      const {accessToken, refreshToken, idToken} = action.payload;
      return {
        ...state,
        accessToken,
        refreshToken,
        idToken,
        isLoggedIn: true,
      };
    case LOGOUT:
      return {
        ...state,
        ...INITIAL_STATE.security,
      };
    default:
      return state;
  }
};

export default AuthReducer;