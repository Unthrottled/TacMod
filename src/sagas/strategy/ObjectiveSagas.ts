import {call, put} from 'redux-saga/effects';
import {performStreamedGet} from '../APISagas';
import {createFetchedObjectivesEvent} from '../../events/StrategyEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';

export const OBJECTIVES_URL = '/strategy/objectives';

export function* objectiveHistoryFetchSaga() {
  try {
    const data = yield call(performStreamedGet, OBJECTIVES_URL);
    yield put(createFetchedObjectivesEvent(data));
  } catch (e) {
    yield put(
      createShowWarningNotificationEvent(
        'Unable to get strategic! Try again later, please.',
      ),
    );
  }
}

export function* objectiveObservationSaga() {
  yield call(console.log, 'Viewed Objectives Again');
}
