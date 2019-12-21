import {all, call, fork, take, takeEvery} from 'redux-saga/effects';
import {
  ActivityUpdatePayload,
  ADJUSTED_HISTORY,
  FOUND_AFTER_CAPSTONE,
  FOUND_BEFORE_CAPSTONE,
  INITIALIZED_HISTORY,
  UPDATED_CAPSTONES,
  VIEWED_HISTORY,
} from '../events/HistoryEvents';
import {RECEIVED_USER} from '../events/UserEvents';
import {
  firstActivityAdjustmentSaga,
  historyAdjustmentSaga,
  historyInitializationSaga,
  historyObservationSaga,
} from './history/ActivityHistorySagas';
import {
  capstoneHistorySaga,
  FullRangeAndFeed,
  getFullHistory,
} from './history/CapstoneHistorySaga';
import {DateRange} from '../reducers/HistoryReducer';
import {STARTED_ACTIVITY} from '../events/ActivityEvents';
import {
  apiAfterCapstoneSaga,
  apiBeforeCapstoneSaga,
  currentActivityHistorySaga,
} from './history/SingularActivityHistorySagas';
import {PayloadEvent} from '../events/Event';

export function* initializeActivityFeedSaga() {
  const {foundUser} = yield all({
    askedForHistory: take(VIEWED_HISTORY),
    foundUser: take(RECEIVED_USER),
  });
  yield fork(historyInitializationSaga, foundUser);
  yield takeEvery(VIEWED_HISTORY, historyObservationSaga);
  yield takeEvery(ADJUSTED_HISTORY, historyAdjustmentSaga);
}

export function* historyFeedAdjustmentSaga() {
  yield all({
    askedForHistory: take(UPDATED_CAPSTONES),
    foundUser: take(RECEIVED_USER),
  });
  yield call(firstActivityAdjustmentSaga);
}

function* listenToActivityEvents() {
  yield fork(initializeActivityFeedSaga);
  yield fork(historyFeedAdjustmentSaga);
  yield takeEvery(ADJUSTED_HISTORY, historyAdjustmentCapstoneSaga);
  yield takeEvery(INITIALIZED_HISTORY, historyInitializationCapstoneSaga);
}

export function* historyAdjustmentCapstoneSaga({
  payload: dateRange,
}: PayloadEvent<DateRange>) {
  const fullRangeAndFeed = yield call(getFullHistory, dateRange);
  yield call(capstoneHistorySaga, dateRange, fullRangeAndFeed);
}

export function* historyInitializationCapstoneSaga({
  payload: {full},
}: PayloadEvent<ActivityUpdatePayload>) {
  const fullRangeAndActivities: FullRangeAndFeed = {
    timeRange: full.between,
    activities: full.activities,
  };
  yield call(capstoneHistorySaga, full.between, fullRangeAndActivities);
}

export function* listenToCurrentActivityEvents() {
  yield takeEvery(STARTED_ACTIVITY, currentActivityHistorySaga);
}

export function* listenToCapstoneEvents() {
  yield takeEvery(FOUND_BEFORE_CAPSTONE, apiBeforeCapstoneSaga);
  yield takeEvery(FOUND_AFTER_CAPSTONE, apiAfterCapstoneSaga);
}

export default function* HistorySagas() {
  yield all([
    listenToActivityEvents(),
    listenToCurrentActivityEvents(),
    listenToCapstoneEvents(),
  ]);
}
