import {call, put, select} from 'redux-saga/effects';
import {performPost} from '../APISagas';
import {selectStrategyState, selectUserState} from '../../reducers';
import {createSyncedObjectivesEvent} from '../../events/StrategyEvents';
import {createSyncedDataEvent} from '../../events/UserEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';

export const BULK_OBJECTIVE_UPLOAD_URL = '/strategy/objectives/bulk';

export function* strategySyncSaga() {
  const globalState = yield select();
  const {
    information: {guid},
  } = selectUserState(globalState);
  const {cache} = selectStrategyState(globalState);
  if (guid && cache && cache[guid]) {
    try {
      yield call(performPost, BULK_OBJECTIVE_UPLOAD_URL, cache[guid]);
      yield put(createSyncedObjectivesEvent(guid));
      yield put(createSyncedDataEvent());
    } catch (e) {
      yield put(
        createShowWarningNotificationEvent(
          'Unable to sync settings! Try again later, please.',
        ),
      );
    }
  }
}
