import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
} from 'redux-saga/effects';
import {
  selectActivityState,
  selectPomodoroState,
  selectStrategyState,
  selectTacticalActivityState,
  selectUserState,
} from '../reducers';
import {
  CACHED_DATA,
  createCheckedCachesEvent,
  RECEIVED_USER,
  SYNCED_DATA,
} from '../events/UserEvents';
import {INITIALIZED_APPLICATION} from '../events/ApplicationLifecycleEvents';

export function* checkCaches() {
  yield take(INITIALIZED_APPLICATION);
  yield call(inspectCaches);
}

export function* inspectCaches() {
  const userGUID = yield call(fetchUserGuidSaga);
  const globalState = yield select();
  const hasCachedItems = [
    selectActivityState,
    selectTacticalActivityState,
    selectPomodoroState,
    selectStrategyState,
  ]
    .map(stateSelector => stateSelector(globalState))
    .map(state => state.cache[userGUID])
    .reduce((accum, cache) => accum || !!cache, false);
  yield call(cachedItemsSaga, hasCachedItems);
}

export function* cachedItemsSaga(hasCachedItems: any = true) {
  yield put(createCheckedCachesEvent(!!hasCachedItems));
}

export function* listenToCachingEvents() {
  yield takeEvery(CACHED_DATA, cachedItemsSaga);
  yield takeEvery(SYNCED_DATA, inspectCaches);
}

export function* fetchUserGuidSaga() {
  const {
    information: {guid},
  } = yield select(selectUserState);
  if (guid) {
    return guid;
  } else {
    const user = yield take(RECEIVED_USER);
    return user.guid;
  }
}

function* listenToEvents() {
  yield fork(checkCaches);
  yield call(listenToCachingEvents);
}

export default function* CacheSagas() {
  yield all([listenToEvents()]);
}
