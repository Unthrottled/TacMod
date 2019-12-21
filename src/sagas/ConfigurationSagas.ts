import {all, fork, takeEvery} from 'redux-saga/effects';
import {
  REQUESTED_INITIAL_CONFIGURATION,
  REQUESTED_OAUTH_CONFIGURATION,
} from '../events/ConfigurationEvents';
import {INITIALIZED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import {securityRequestSaga} from './configuration/OAuthConfigurationSagas';
import {authorizationServiceConfigurationSaga} from './configuration/ConfigurationSetupSagas';
import {
  initialConfigurationResponseSaga,
  initialConfigurationSaga,
} from './configuration/InitialConfigurationSagas';

function* listenToApplicationEvents() {
  yield takeEvery(INITIALIZED_APPLICATION, initialConfigurationSaga);
}

function* listenToConfigurationRequestEvents() {
  yield takeEvery(REQUESTED_OAUTH_CONFIGURATION, securityRequestSaga);
  yield takeEvery(
    REQUESTED_INITIAL_CONFIGURATION,
    initialConfigurationResponseSaga,
  );
}

export default function* rootSaga() {
  yield all([
    listenToApplicationEvents(),
    fork(authorizationServiceConfigurationSaga),
    listenToConfigurationRequestEvents(),
  ]);
}
