import {
  EXPIRED_SESSION,
  INITIALIZED_SECURITY,
  LOGGED_OFF,
  LOGGED_ON,
  RECEIVED_TOKENS,
  REQUESTED_LOGOFF,
  REQUESTED_TOKEN,
  REQUESTED_LOGON,
} from '../events/SecurityEvents';
import {tokenReceptionReducer} from './security/TokenReducer';
import {RECEIVED_USER} from '../events/UserEvents';
import {TokenInformation} from '../types/SecurityTypes';
import {
  TIME_IS_WACK,
  UNINITIALIZED_APPLICATION,
} from '../events/ApplicationLifecycleEvents';

export type SecurityState = {
  isLoggedIn: boolean;
  accessToken: string;
  accessTokenInformation: TokenInformation;
  refreshToken: string;
  refreshTokenInformation: TokenInformation;
  idToken?: string;
  realAccessToken: string;
  verificationKey: string;
  isExpired: boolean;
  isInitialized: boolean;
  isOutOfSync: boolean;
  isLoggingOut: boolean;
  identityProvider?: string;
};

const defaultTokenInfo = {
  issuedAt: 0,
  expiresAt: 69,
};
export const INITIAL_SECURITY_STATE: SecurityState = {
  refreshTokenInformation: defaultTokenInfo,
  accessToken: '',
  accessTokenInformation: defaultTokenInfo,
  idToken: '',
  refreshToken: '',
  verificationKey: '',
  isLoggedIn: false,
  realAccessToken: '',
  isExpired: false,
  isInitialized: false,
  isOutOfSync: false,
  isLoggingOut: false,
};

const securityReducer = (state = INITIAL_SECURITY_STATE, action: any) => {
  switch (action.type) {
    case LOGGED_ON:
      return {
        ...state,
        isLoggedIn: true,
      };
    case LOGGED_OFF:
      return {
        ...INITIAL_SECURITY_STATE,
        identityProvider: state.identityProvider,
      };
    case REQUESTED_TOKEN:
      return {
        ...state,
      };
    case REQUESTED_LOGON: {
      return {
        ...state,
        identityProvider: action.payload,
      };
    }
    case EXPIRED_SESSION:
      delete state.refreshToken;
      delete state.refreshTokenInformation;
      return {
        ...state,
        isExpired: true,
      };
    case INITIALIZED_SECURITY:
      return {
        ...state,
        isExpired: false,
        isInitialized: true,
      };
    case UNINITIALIZED_APPLICATION:
      return {
        ...state,
        isExpired: false,
        isInitialized: false,
      };
    case TIME_IS_WACK:
      return {
        ...state,
        isOutOfSync: true,
      };
    case RECEIVED_TOKENS:
      return tokenReceptionReducer(state, action.payload);
    case RECEIVED_USER:
      return {
        ...state,
        ...action.payload.security,
      };
    case REQUESTED_LOGOFF:
      return {
        ...state,
        isLoggingOut: true,
      };
    default:
      return state;
  }
};

export default securityReducer;
