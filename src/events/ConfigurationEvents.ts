import {InitialConfig, OAuthConfig} from '../types/ConfigurationTypes';
import {BaseEvent, PayloadEvent} from './Event';
import {AuthConfiguration} from "react-native-app-auth";

export const REQUESTED_OAUTH_CONFIGURATION: 'REQUESTED_OAUTH_CONFIGURATION' =
  'REQUESTED_OAUTH_CONFIGURATION';
export const REQUESTED_INITIAL_CONFIGURATION: 'REQUESTED_INITIAL_CONFIGURATION' =
  'REQUESTED_INITIAL_CONFIGURATION';
export const FAILED_RECEPTION_INITIAL_CONFIGURATION: 'FAILED_RECEPTION_INITIAL_CONFIGURATION' =
  'FAILED_RECEPTION_INITIAL_CONFIGURATION';
export const FOUND_INITIAL_CONFIGURATION: 'FOUND_INITIAL_CONFIGURATION' =
  'FOUND_INITIAL_CONFIGURATION';
export const RECEIVED_OAUTH_CONFIGURATION: 'RECEIVED_OAUTH_CONFIGURATION' =
  'RECEIVED_OAUTH_CONFIGURATION';
export const RECEIVED_REMOTE_OAUTH_CONFIGURATION: 'RECEIVED_REMOTE_OAUTH_CONFIGURATION' =
  'RECEIVED_REMOTE_OAUTH_CONFIGURATION';
export const FAILED_TO_RECEIVE_REMOTE_OAUTH_CONFIGURATION: 'FAILED_TO_RECEIVE_REMOTE_OAUTH_CONFIGURATION' =
  'FAILED_TO_RECEIVE_REMOTE_OAUTH_CONFIGURATION';
export const RECEIVED_INITIAL_CONFIGURATION: 'RECEIVED_INITIAL_CONFIGURATION' =
  'RECEIVED_INITIAL_CONFIGURATION';
export const RECEIVED_PARTIAL_INITIAL_CONFIGURATION: 'RECEIVED_PARTIAL_INITIAL_CONFIGURATION' =
  'RECEIVED_PARTIAL_INITIAL_CONFIGURATION';
export const NOTIFICATION_ANSWERED: 'NOTIFICATION_ANSWERED' =
  'NOTIFICATION_ANSWERED';

export const createFailedToGetRemoteOAuthConfigurationsEvent = (): BaseEvent => ({
  type: FAILED_TO_RECEIVE_REMOTE_OAUTH_CONFIGURATION,
});

export const createReceivedOAuthConfigurations = (
  oauthConfig: AuthConfiguration,
): PayloadEvent<AuthConfiguration> => ({
  type: RECEIVED_OAUTH_CONFIGURATION,
  payload: oauthConfig,
});

export const createNotificationPermissionReceivedEvent = (
  notificationPermission: String,
): PayloadEvent<String> => ({
  type: NOTIFICATION_ANSWERED,
  payload: notificationPermission,
});

export const createReceivedRemoteOAuthConfigurations = (
  oauthConfig: OAuthConfig,
): PayloadEvent<OAuthConfig> => ({
  type: RECEIVED_REMOTE_OAUTH_CONFIGURATION,
  payload: oauthConfig,
});

export const createReceivedInitialConfigurationsEvent = (
  initialConfig: InitialConfig,
): PayloadEvent<InitialConfig> => ({
  type: RECEIVED_INITIAL_CONFIGURATION,
  payload: initialConfig,
});

export const createReceivedPartialInitialConfigurationsEvent = (
  initialConfig: InitialConfig,
): PayloadEvent<InitialConfig> => ({
  type: RECEIVED_PARTIAL_INITIAL_CONFIGURATION,
  payload: initialConfig,
});

export const createFailedToGetInitialConfigurationsEvent = (
  error: Error,
): PayloadEvent<Error> => ({
  type: FAILED_RECEPTION_INITIAL_CONFIGURATION,
  payload: error,
});

export const createFoundInitialConfigurationsEvent = (
  initialConfig: InitialConfig,
): PayloadEvent<InitialConfig> => ({
  type: FOUND_INITIAL_CONFIGURATION,
  payload: initialConfig,
});

export const createRequestForInitialConfigurations = (): BaseEvent => ({
  type: REQUESTED_INITIAL_CONFIGURATION,
});

export const requestOAuthConfigurations = (): BaseEvent => ({
  type: REQUESTED_OAUTH_CONFIGURATION,
});
