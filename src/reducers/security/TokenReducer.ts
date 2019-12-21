import {SecurityState} from '../SecurityReducer';
import jwtDecode from 'jwt-decode';
import {AuthorizeResult} from 'react-native-app-auth';

const getRefreshTokenInformation = (refreshToken: string | undefined) => {
  if (refreshToken) {
    const decodedToken: any = jwtDecode(refreshToken);
    return {
      refreshTokenInformation: {
        issuedAt: decodedToken.iat,
        expiresAt: decodedToken.exp,
      },
    };
  } else {
    return {};
  }
};

export const tokenReceptionReducer = (
  state: SecurityState,
  tokenReceptionPayload: AuthorizeResult,
): SecurityState => {
  return {
    ...state,
    accessToken: tokenReceptionPayload.accessToken,
    accessTokenInformation: {
      // issuedAt: tokenReceptionPayload.issuedAt,
      // expiresAt: tokenReceptionPayload.issuedAt + (tokenReceptionPayload.expiresIn || 0)
    },
    ...getRefreshTokenInformation(tokenReceptionPayload.refreshToken),
    refreshToken: tokenReceptionPayload.refreshToken || state.refreshToken,
    idToken: tokenReceptionPayload.idToken,
  };
};
