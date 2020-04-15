import {all, call, fork, take, takeEvery} from '@redux-saga/core/effects';
import {RECEIVED_USER, REQUESTED_SYNC} from '../events/UserEvents';
import {
  CREATED_ACTIVITY,
  HID_ACTIVITY,
  RANKED_ACTIVITIES,
  REQUESTED_ACTIVITY_DELETION,
  UNHID_ACTIVITY,
  UPDATED_ACTIVITY,
  UPDATED_POMODORO_SETTINGS,
  VIEWED_ACTIVITIES,
  VIEWED_SETTINGS,
} from '../events/TacticalEvents';
import {FOUND_WIFI} from '../events/NetworkEvents';
import {tacticalActivitySyncSaga} from './tactical/TacticalActivitySyncSaga';
import {
  activityChangesSaga,
  activityCreationSaga,
  activityRankSaga,
  activityTerminationSaga,
} from './tactical/TacticalActivityCreationSagas';
import {fetchSettings, settingsSyncSaga, updatePomodoroSaga,} from './tactical/PomodoroSettingsSagas';
import {tacticalActivitiesFetchSaga, tacticalActivityObservationSaga,} from './tactical/TacticalActivitiesSagas';
import {tacticalActivityHiddenSaga, tacticalActivityShownSaga,} from './tactical/TacticalActivityVisibilitySagas';

function* initializeTacticalSettings() {
  yield take(RECEIVED_USER);
  yield call(fetchSettings);
  yield fork(settingsSyncSaga);
  yield takeEvery(FOUND_WIFI, settingsSyncSaga);
  yield takeEvery(REQUESTED_SYNC, settingsSyncSaga);
  yield takeEvery(VIEWED_SETTINGS, fetchSettings);
}

function* watchForSettingsUpdates() {
  yield takeEvery(UPDATED_POMODORO_SETTINGS, updatePomodoroSaga);
}

function* tacticalActivitiesObservationInitializationSaga() {
  yield takeEvery(VIEWED_ACTIVITIES, tacticalActivityObservationSaga);
  yield take(RECEIVED_USER);
  yield fork(tacticalActivitiesFetchSaga);
}

function* listenForTacticalEvents() {
  yield fork(tacticalActivitiesObservationInitializationSaga);
  yield takeEvery(FOUND_WIFI, tacticalActivitySyncSaga);
  yield takeEvery(RECEIVED_USER, tacticalActivitySyncSaga);
  yield takeEvery(REQUESTED_SYNC, tacticalActivitySyncSaga);
  yield takeEvery(CREATED_ACTIVITY, activityCreationSaga);
  yield takeEvery(UPDATED_ACTIVITY, activityChangesSaga);
  yield takeEvery(RANKED_ACTIVITIES, activityRankSaga);
  yield takeEvery(REQUESTED_ACTIVITY_DELETION, activityTerminationSaga);
  yield takeEvery(HID_ACTIVITY, tacticalActivityHiddenSaga);
  yield takeEvery(UNHID_ACTIVITY, tacticalActivityShownSaga);
}

export default function* rootSaga() {
  yield all([
    initializeTacticalSettings(),
    listenForTacticalEvents(),
    watchForSettingsUpdates(),
  ]);
}
