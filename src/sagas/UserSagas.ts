import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {LOGGED_ON} from '../events/SecurityEvents';
import {performGetWithoutVerification} from './APISagas';
import {
  createFailedToGetUserEvent,
  createReceivedUserEvent,
} from '../events/UserEvents';
import {GlobalState, selectSecurityState, selectUserState} from '../reducers';
import {FOCUSED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import {SecurityState} from '../reducers/SecurityReducer';

export function* findUserSaga() {
  const {isLoggedIn, verificationKey}: SecurityState = yield select(
    selectSecurityState,
  );
  if (isLoggedIn && !verificationKey) {
    yield call(requestUserSaga);
  }
}

export function* requestUserSaga() {
  try {
    const {data: user} = yield call(performGetWithoutVerification, '/user');
    yield put(createReceivedUserEvent(user)); // found waldo.
  } catch (e) {
    yield put(createFailedToGetUserEvent(e));
  }
}

export function* userContextRefreshSaga() {
  const globalState: GlobalState = yield select(g => g);
  const securityState = selectSecurityState(globalState);
  const userState = selectUserState(globalState);
  if (userState.information.guid) {
    yield put(
      createReceivedUserEvent({
        information: {
          ...userState.information,
        },
        security: {
          verificationKey: securityState.verificationKey,
        },
        misc: {
          ...userState.miscellaneous,
        },
      }),
    );
  }
}

function* listenToSecurityEvents() {
  yield takeEvery(LOGGED_ON, findUserSaga);
  yield takeEvery(FOCUSED_APPLICATION, userContextRefreshSaga);
}

export default function* rootSaga() {
  yield all([listenToSecurityEvents()]);
}
