import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_SECURITY} from '../events/SecurityEvents';
import {performGet} from './APISagas';
import {
  createFailedToGetUserEvent,
  createReceivedUserEvent,
} from '../events/UserEvents';
import {selectSecurityState} from '../reducers';

export function* findUserSaga() {
  const {isLoggedIn} = yield select(selectSecurityState);
  if (isLoggedIn) {
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

function* listenToSecurityEvents() {
  yield takeEvery(INITIALIZED_SECURITY, findUserSaga);
}

export default function* rootSaga() {
  yield all([listenToSecurityEvents()]);
}
