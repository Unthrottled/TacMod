import {call, put, select} from 'redux-saga/effects';
import {performPost} from '../APISagas';
import {selectTacticalActivityState, selectUserState} from '../../reducers';
import {createSyncedDataEvent} from '../../events/UserEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';
import {createSyncedTacticalActivitiesEvent} from '../../events/TacticalEvents';

export const BULK_ACTIVITY_UPLOAD_URL = '/tactical/activity/bulk';

export function* tacticalActivitySyncSaga() {
  const globalState = yield select();
  const {
    information: {guid},
  } = selectUserState(globalState);
  const {cache} = selectTacticalActivityState(globalState);
  if (guid && cache && cache[guid]) {
    try {
      yield call(performPost, BULK_ACTIVITY_UPLOAD_URL, cache[guid]);
      yield put(createSyncedTacticalActivitiesEvent(guid));
      yield put(createSyncedDataEvent());
    } catch (e) {
      yield put(
        createShowWarningNotificationEvent(
          'Unable to sync created activities! Try again later, please.',
        ),
      );
    }
  }
}
