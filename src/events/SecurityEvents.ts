import {TokenRequest, TokenResponse} from '@openid/appauth';
import {OAuthConfig} from '../types/ConfigurationTypes';

export const LOGGED_ON: 'LOGGED_ON' = 'LOGGED_ON';
export const LOGGED_OFF: 'LOGGED_OFF' = 'LOGGED_OFF';
export const REQUESTED_LOGOFF: 'REQUESTED_LOGOFF' = 'REQUESTED_LOGOFF';
export const REQUESTED_LOGON: 'REQUESTED_LOGON' = 'REQUESTED_LOGON';
export const REQUESTED_AUTH_CHECK: 'REQUESTED_AUTH_CHECK' =
  'REQUESTED_AUTH_CHECK';
export const CHECKED_AUTH: 'CHECKED_AUTH' = 'CHECKED_AUTH';
export const RECEIVED_TOKENS: 'RECEIVED_TOKENS' = 'RECEIVED_TOKENS';
export const FAILED_TO_RECEIVE_TOKEN: 'FAILED_TO_RECEIVE_TOKEN' =
  'FAILED_TO_RECEIVE_TOKEN';
export const INITIALIZED_SECURITY: 'INITIALIZED_SECURITY' =
  'INITIALIZED_SECURITY';
export const EXPIRED_SESSION: 'EXPIRED_SESSION' = 'EXPIRED_SESSION';

export const requestLogoff = () => ({
  type: REQUESTED_LOGOFF,
});

export const createRequestLogonEvent = () => ({
  type: REQUESTED_LOGON,
});

export const createExpiredSessionEvent = () => ({
  type: EXPIRED_SESSION,
});

export const requestAuthorizationGrantCheck = (oauthConfig: OAuthConfig) => ({
  type: REQUESTED_AUTH_CHECK,
  payload: oauthConfig,
});

export const createTokenReceptionEvent = (tokenResponse: TokenResponse) => ({
  type: RECEIVED_TOKENS,
  payload: tokenResponse,
});

export type TokenFailurePayload = {
  tokenRequest: TokenRequest;
  error: any;
};

export const createTokenFailureEvent = (
  tokenFailurePayload: TokenFailurePayload,
) => ({
  type: FAILED_TO_RECEIVE_TOKEN,
  payload: tokenFailurePayload,
});

export const createSecurityInitializedEvent = () => ({
  type: INITIALIZED_SECURITY,
});

export const createCheckedAuthorizationEvent = () => ({
  type: CHECKED_AUTH,
});

export const createLoggedOffEvent = () => ({
  type: LOGGED_OFF,
});

export const createLoggedOnAction = () => ({
  type: LOGGED_ON,
});
