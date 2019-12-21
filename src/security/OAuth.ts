import {SecurityState} from '../reducers/SecurityReducer';

export const shouldCheckForAuthorizationGrant = (
  securityState: SecurityState,
) => {
  return !isAccessTokenValid(securityState);
};

export const canRefreshToken = (securityState: SecurityState) => {
  return !isAccessTokenValid(securityState);
};

const nowInSeconds = () => new Date().valueOf() / 1000;

/**
 * Checks to see if the access token or refresh token is about expire.
 * This is because the access token is probably still good because of the
 * polling, this way the user can have sessions longer than the refresh token.
 *
 * @param securityState
 * @returns if the access token or refresh token need to be replaced.
 */
export const canRefreshEitherTokens = (securityState: SecurityState) => {
  return (
    (!isAccessTokenValid(securityState) &&
      securityState &&
      securityState.refreshToken) ||
    !isRefreshTokenValid(securityState)
  );
};

export const isAccessTokenValid = (securityState: SecurityState) => {
  return (
    securityState &&
    securityState.accessTokenInformation &&
    securityState.accessTokenInformation.expiresAt - 5 >= nowInSeconds()
  );
};

export const isRefreshTokenValid = (securityState: SecurityState) => {
  return (
    securityState &&
    securityState.refreshTokenInformation &&
    securityState.refreshTokenInformation.expiresAt - 900 >= nowInSeconds()
  );
};
