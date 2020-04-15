import {
  NOTIFICATION_ANSWERED,
  RECEIVED_INITIAL_CONFIGURATION,
  RECEIVED_PARTIAL_INITIAL_CONFIGURATION,
  RECEIVED_REMOTE_OAUTH_CONFIGURATION,
} from '../events/ConfigurationEvents';
import {InitialConfig, MiscellaneousConfig, NOT_ASKED, OAuthConfig,} from '../types/ConfigurationTypes';

export type ConfigurationState = {
  oauth: OAuthConfig;
  initial: InitialConfig;
  miscellaneous: MiscellaneousConfig;
};

export const INITIAL_CONFIGURATION_STATE: ConfigurationState = {
  oauth: {
    authorizationEndpoint: '',
    endSessionEndpoint: '',
    revocationEndpoint: '',
    tokenEndpoint: '',
    userInfoEndpoint: '',
  },
  initial: {
    clientID: '',
    issuer: '',
    authorizationEndpoint: '',
    appClientID: '',
    logoutEndpoint: '',
    userInfoEndpoint: '',
    tokenEndpoint: '',
    openIDConnectURI: '',
    provider: '',
  },
  miscellaneous: {
    notificationsAllowed: NOT_ASKED,
  },
};

export const configurationReducer = (
  state: ConfigurationState = INITIAL_CONFIGURATION_STATE,
  action: any,
) => {
  switch (action.type) {
    case RECEIVED_REMOTE_OAUTH_CONFIGURATION:
      return {
        ...state,
        oauth: {
          ...state.oauth,
          ...action.payload,
        },
      };
    case RECEIVED_INITIAL_CONFIGURATION:
    case RECEIVED_PARTIAL_INITIAL_CONFIGURATION:
      return {
        ...state,
        initial: {
          ...state.initial,
          ...action.payload,
        },
      };
    case NOTIFICATION_ANSWERED:
      return {
        ...state,
        miscellaneous: {
          ...state.miscellaneous,
          notificationsAllowed: action.payload,
        },
      };
    default:
      return state;
  }
};

export default configurationReducer;
