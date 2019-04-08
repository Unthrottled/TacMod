import { combineReducers } from 'redux';
import AuthReducer from 'reducers/auth';

export const INITIAL_STATE = {
  security:{
    isLoggedIn: false,
    refreshToken: '',
    accessToken: '',
    idToken: '',
  }
};

export default combineReducers({
  security: AuthReducer
})