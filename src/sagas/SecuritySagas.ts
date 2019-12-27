import {call, all, fork, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import oauthInitializationSaga from './security/SecurityInitializationSaga';
import {
  REQUESTED_AUTH_CHECK,
  REQUESTED_LOGOFF,
  REQUESTED_LOGON,
} from '../events/SecurityEvents';
import {
  authorizationGrantSaga,
  loginSaga,
} from './security/AuthorizationFlowSagas';
import logoutSaga from './security/LogoutSaga';
import {oauthConfigurationSaga} from './configuration/ConfigurationConvienenceSagas';

function* securityRequestSaga() {
  const oauthConfig = yield oauthConfigurationSaga();
  yield call(oauthInitializationSaga, oauthConfig);
}

function* listenToStartupEvent() {
  yield takeEvery(INITIALIZED_APPLICATION, securityRequestSaga);
}

function* listenToAppLifecycleEvents() {
  yield fork(listenToStartupEvent);
}

function* listenToLoginEvents() {
  yield takeEvery(REQUESTED_LOGON, loginSaga);
  yield takeEvery(REQUESTED_LOGOFF, logoutSaga);
}

function* listenToSecurityEvents() {
  yield takeEvery(REQUESTED_AUTH_CHECK, authorizationGrantSaga);
}

export default function* rootSaga() {
  yield all([
    listenToAppLifecycleEvents(),
    listenToLoginEvents(),
    listenToSecurityEvents(),
  ]);
}
