import {all, fork, take, takeEvery} from 'redux-saga/effects';
import {
  COMPLETED_OBJECTIVE,
  CREATED_OBJECTIVE,
  DELETED_OBJECTIVE,
  UPDATED_OBJECTIVE,
  VIEWED_OBJECTIVES,
} from '../events/StrategyEvents';
import {RECEIVED_USER, REQUESTED_SYNC} from '../events/UserEvents';
import {
  objectiveChangesSaga,
  objectiveCompletionSaga,
  objectiveCreationSaga,
  objectiveTerminationSaga,
} from './strategy/ObjectiveCreationSagas';
import {objectiveHistoryFetchSaga, objectiveObservationSaga,} from './strategy/ObjectiveSagas';
import {FOUND_WIFI} from '../events/NetworkEvents';
import {strategySyncSaga} from './strategy/StrategySyncSaga';

export function* objectiveObservationInitializationSaga() {
  yield take(RECEIVED_USER);
  yield fork(objectiveHistoryFetchSaga);
  yield takeEvery(VIEWED_OBJECTIVES, objectiveObservationSaga);
}

function* listenToActivityEvents() {
  yield takeEvery(CREATED_OBJECTIVE, objectiveCreationSaga);
  yield takeEvery(UPDATED_OBJECTIVE, objectiveChangesSaga);
  yield takeEvery(DELETED_OBJECTIVE, objectiveTerminationSaga);
  yield takeEvery(COMPLETED_OBJECTIVE, objectiveCompletionSaga);
  yield takeEvery(FOUND_WIFI, strategySyncSaga);
  yield takeEvery(RECEIVED_USER, strategySyncSaga);
  yield takeEvery(REQUESTED_SYNC, strategySyncSaga);
  yield fork(objectiveObservationInitializationSaga);
}

export default function* StrategySagas() {
  yield all([listenToActivityEvents()]);
}
