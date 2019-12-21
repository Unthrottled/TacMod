import {call, put} from 'redux-saga/effects';
import {InitialConfig, OAuthConfig} from '../../types/ConfigurationTypes';
import {
  initialConfigurationSaga,
  oauthConfigurationSaga,
} from '../configuration/ConfigurationConvienenceSagas';
import {createLoggedOffEvent} from '../../events/SecurityEvents';
import {activityLogoutSaga} from '../activity/LogoutActivitySaga';

export function* constructRedirectURI() {
  const {endSessionEndpoint}: OAuthConfig = yield call(oauthConfigurationSaga);
  const initialConfig = yield call(initialConfigurationSaga);
  return `${endSessionEndpoint}?${getRedirectParameter(initialConfig)}`;
}

const getClientIfNecessary = (initialConfig: InitialConfig): String => {
  if (isCognito(initialConfig)) {
    return `client_id=${initialConfig.clientID}&`;
  } else {
    return '';
  }
};

const getRedirectParameter = (initialConfig: InitialConfig): string => {
  const queryParameter = getQueryParameter(initialConfig);
  return `${getClientIfNecessary(initialConfig)}${queryParameter}=${
    initialConfig.callbackURI
  }`;
};

const getQueryParameter = (initialConfig: InitialConfig): string => {
  if (isOkta(initialConfig) || isKeycloak(initialConfig)) {
    return 'redirect_uri';
  } else {
    return 'logout_uri';
  }
};

const isKeycloak = (initialConfiguration: InitialConfig): boolean => {
  return initialConfiguration && initialConfiguration.provider === 'KEYCLOAK';
};

const isOkta = (initialConfiguration: InitialConfig): boolean => {
  return initialConfiguration && initialConfiguration.provider === 'OKTA';
};

// Thanks Obama.
const isCognito = (initialConfiguration: InitialConfig): boolean => {
  return initialConfiguration && initialConfiguration.provider === 'COGNITO';
};

export function* logoffPreFlightSaga() {
  // do stuff
  yield call(activityLogoutSaga);
  yield put(createLoggedOffEvent()); // wipe state
}

export function pushRedirect(href: string) {
  document.location.href = href;
  return Promise.resolve();
}

export default function* logoutSaga() {
  yield call(logoffPreFlightSaga);
  const href = yield call(constructRedirectURI);
  yield call(pushRedirect, href);
}
