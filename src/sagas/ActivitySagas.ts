import {all, fork, takeEvery} from 'redux-saga/effects';
import {STARTED_ACTIVITY} from '../events/ActivityEvents';
import {activityLogonSaga} from './activity/LogonActivitySaga';
import {currentActivitySaga} from './activity/CurrentActivitySaga';
import {registerActivitySaga} from './activity/RegisterActivitySaga';
import {FOUND_WIFI} from '../events/NetworkEvents';
import {activitySyncSaga} from './activity/ActivitySyncSaga';
import {REQUESTED_SYNC} from '../events/UserEvents';
import {pomodoroActivityInitializationSaga} from './activity/PomodoroActivitySagas';
import {FOCUSED_APPLICATION} from '../events/ApplicationLifecycleEvents';

function* listenToActivityEvents() {
  yield takeEvery(STARTED_ACTIVITY, registerActivitySaga);
  yield takeEvery(FOUND_WIFI, activitySyncSaga);
  yield takeEvery(REQUESTED_SYNC, activitySyncSaga);
  yield fork(activityLogonSaga);
  yield fork(currentActivitySaga);
  yield takeEvery(FOCUSED_APPLICATION, currentActivitySaga);
  yield fork(pomodoroActivityInitializationSaga);
}

export default function* rootSaga() {
  yield all([listenToActivityEvents()]);
}
