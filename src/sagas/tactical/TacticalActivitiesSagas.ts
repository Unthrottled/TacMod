import {call, put} from 'redux-saga/effects';
import {performStreamedGet} from '../APISagas';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';
import {createFetchedTacticalActivitesEvent} from '../../events/TacticalEvents';

export const TACTICAL_ACTIVITIES_URL = '/tactical/activity';

export function* tacticalActivitiesFetchSaga() {
  try {
    const data = yield call(performStreamedGet, TACTICAL_ACTIVITIES_URL);
    yield put(createFetchedTacticalActivitesEvent(data));
  } catch (e) {
    yield put(
      createShowWarningNotificationEvent(
        'Unable to get Activities! Try again later, please.',
      ),
    );
  }
}

export function* tacticalActivityObservationSaga() {
  yield call(tacticalActivitiesFetchSaga);
}
