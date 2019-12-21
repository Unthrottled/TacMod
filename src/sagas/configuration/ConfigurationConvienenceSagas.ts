import {put, take} from 'redux-saga/effects';
import {
  createRequestForInitialConfigurations,
  FOUND_INITIAL_CONFIGURATION,
  RECEIVED_OAUTH_CONFIGURATION,
  requestOAuthConfigurations,
} from '../../events/ConfigurationEvents';

export function* oauthConfigurationSaga() {
  yield put(requestOAuthConfigurations()); // ask for oauth configurations
  const {payload: oauthConfig} = yield take(RECEIVED_OAUTH_CONFIGURATION); // yay configurations!
  return oauthConfig;
}

export function* initialConfigurationSaga() {
  yield put(createRequestForInitialConfigurations());
  const {payload: initialConfigurations} = yield take(
    FOUND_INITIAL_CONFIGURATION,
  );
  return initialConfigurations;
}
