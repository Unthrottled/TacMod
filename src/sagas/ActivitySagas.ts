import {all, fork, takeEvery} from 'redux-saga/effects';
import {STARTED_ACTIVITY} from '../events/ActivityEvents';
import {activityLogonSaga} from './activity/LogonActivitySaga';
import {
  canceledPomodoroSaga,
  createBreakPomodoroChannel,
  createPomodoroCanceledChannel,
  createPomodoroErrorChannel,
  createStartedPomodoroChannel,
  currentActivitySaga,
  handleNewActivity,
  pomoBreakSaga,
  pomoErrorSaga,
} from './activity/CurrentActivitySaga';
import {registerActivitySaga} from './activity/RegisterActivitySaga';
import {FOUND_WIFI} from '../events/NetworkEvents';
import {activitySyncSaga} from './activity/ActivitySyncSaga';
import {REQUESTED_SYNC} from '../events/UserEvents';
import {pomodoroActivityInitializationSaga} from './activity/PomodoroActivitySagas';
import {FOCUSED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import {VIEWED_ACTIVITY_SELECTION} from '../events/TacticalEvents';

function* listenToActivityEvents() {
  yield takeEvery(STARTED_ACTIVITY, registerActivitySaga);
  yield takeEvery(FOUND_WIFI, activitySyncSaga);
  yield takeEvery(REQUESTED_SYNC, activitySyncSaga);
  yield fork(activityLogonSaga);
  yield fork(currentActivitySaga);
  yield takeEvery(FOCUSED_APPLICATION, currentActivitySaga);
  yield fork(pomodoroActivityInitializationSaga);
  yield takeEvery(
    VIEWED_ACTIVITY_SELECTION,
    pomodoroActivityInitializationSaga,
  );
  yield takeEvery(createStartedPomodoroChannel(), handleNewActivity);
  yield takeEvery(createBreakPomodoroChannel(), pomoBreakSaga);
  yield takeEvery(createPomodoroErrorChannel(), pomoErrorSaga);
  yield takeEvery(createPomodoroCanceledChannel(), canceledPomodoroSaga);
}

export default function* rootSaga() {
  yield all([listenToActivityEvents()]);
}
