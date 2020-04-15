import {all, call, delay, fork, select, takeEvery} from 'redux-saga/effects';
import {FOCUSED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import oauthInitializationSaga from './security/SecurityInitializationSaga';
import {EXPIRED_SESSION, REQUESTED_LOGOFF, REQUESTED_LOGON,} from '../events/SecurityEvents';
import {loginSaga} from './security/AuthorizationFlowSagas';
import logoutSaga from './security/LogoutSaga';
import {SecurityState} from '../reducers/SecurityReducer';
import {selectSecurityState} from '../reducers';

function* securityRequestSaga() {
  yield call(oauthInitializationSaga);
}

function* listenToStartupEvent() {
  yield takeEvery(FOCUSED_APPLICATION, securityRequestSaga);
}

function* listenToAppLifecycleEvents() {
  yield fork(listenToStartupEvent);
}

function* listenToLoginEvents() {
  yield takeEvery(REQUESTED_LOGON, loginSaga);
  yield takeEvery(REQUESTED_LOGOFF, logoutSaga);
}

// Wait for all other decoupled events
// to complete before sending user off
// to the authorization server.
function* waitBeforeLoggingIn() {
  const {isLoggedIn}: SecurityState = yield select(selectSecurityState);
  if (isLoggedIn) {
    yield delay(2000);
    yield call(loginSaga);
  }
}

function* listenToSecurityEvents() {
  yield takeEvery(EXPIRED_SESSION, waitBeforeLoggingIn);
}

export default function* rootSaga() {
  yield all([
    listenToAppLifecycleEvents(),
    listenToLoginEvents(),
    listenToSecurityEvents(),
  ]);
}
