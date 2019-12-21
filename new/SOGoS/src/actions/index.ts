import Logger from "../util/Logger";

export const LOGIN: 'LOGIN' = 'LOGIN';
export const LOGOUT: 'LOGOUT' = 'LOGOUT';

export const createLoggedInAction = authState => ({
  type: LOGIN,
  payload: {
    accessToken: authState.accessToken,
    idToken: authState.idToken,
    refreshToken: authState.refreshToken,
  }
});

// todo: track when user logs out
export const createLoggedOutAction = () => ({
  type: LOGOUT,
  payload: {}
});

export const loggedInAction = authState => (dispetch, state) => {
  dispetch(createLoggedInAction(authState));
};

export const loggedOutAction = () => (dispetch, state) => {
  dispetch(createLoggedOutAction());
};