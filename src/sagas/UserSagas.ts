import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_SECURITY} from '../events/SecurityEvents';
import {performGet} from './APISagas';
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
    const {data: user} = yield call(performGet, '/user');
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
      }),
    );
  }
}

function* listenToSecurityEvents() {
  yield takeEvery(INITIALIZED_SECURITY, findUserSaga);
  yield takeEvery(FOCUSED_APPLICATION, userContextRefreshSaga);
}

export default function* rootSaga() {
  yield all([listenToSecurityEvents()]);
}
