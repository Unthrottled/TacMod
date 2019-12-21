import {all, fork, takeEvery} from 'redux-saga/effects';
import {
  STARTED_ACTIVITY,
  STARTED_TIMED_ACTIVITY,
} from '../events/ActivityEvents';
import {activityLogonSaga} from './activity/LogonActivitySaga';
import {currentActivitySaga} from './activity/CurrentActivitySaga';
import {registerActivitySaga} from './activity/RegisterActivitySaga';
import {FOUND_WIFI} from '../events/NetworkEvents';
import {activitySyncSaga} from './activity/ActivitySyncSaga';
import {activityNotificationSaga} from './activity/ActivityNotificationSaga';
import {REQUESTED_SYNC} from '../events/UserEvents';
import {pomodoroActivityInitializationSaga} from './activity/PomodoroActivitySagas';

function* listenToActivityEvents() {
  yield takeEvery(STARTED_ACTIVITY, registerActivitySaga);
  yield takeEvery(FOUND_WIFI, activitySyncSaga);
  yield takeEvery(REQUESTED_SYNC, activitySyncSaga);
  yield takeEvery(STARTED_TIMED_ACTIVITY, activityNotificationSaga);
  yield fork(activityLogonSaga);
  yield fork(currentActivitySaga);
  yield fork(pomodoroActivityInitializationSaga);
}

export default function* rootSaga() {
  yield all([listenToActivityEvents()]);
}
