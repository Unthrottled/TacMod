import {SecurityState} from '../SecurityReducer';
import jwtDecode from 'jwt-decode';
import {AuthorizeResult} from 'react-native-app-auth';

const getRefreshTokenInformation = (refreshToken: string) => {
  const decodedToken: any = jwtDecode(refreshToken);
  return {
    issuedAt: decodedToken.iat,
    expiresAt: decodedToken.exp,
  };
};

export const tokenReceptionReducer = (
  state: SecurityState,
  tokenReceptionPayload: AuthorizeResult,
): SecurityState => {
  return {
    ...state,
    isRequestingToken: false, // prevents multiple authorization requests
    accessToken: tokenReceptionPayload.accessToken,
    accessTokenInformation: getRefreshTokenInformation(
      tokenReceptionPayload.accessToken,
    ),
    ...(tokenReceptionPayload.refreshToken
      ? {
          refreshToken: tokenReceptionPayload.refreshToken,
          refreshTokenInformation: getRefreshTokenInformation(
            tokenReceptionPayload.refreshToken,
          ),
        }
      : {}),
    idToken: tokenReceptionPayload.idToken,
  };
};
