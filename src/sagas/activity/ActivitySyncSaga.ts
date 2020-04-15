import {call, put, select} from 'redux-saga/effects';
import {performPost} from '../APISagas';
import {createSyncedActivitiesEvent} from '../../events/ActivityEvents';
import {selectActivityState, selectUserState} from '../../reducers';
import {createSyncedDataEvent} from '../../events/UserEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';

export const BULK_UPLOAD_URL = '/activity/bulk';

export function* activitySyncSaga() {
  const globalState = yield select();
  const {
    information: {guid},
  } = selectUserState(globalState);
  const {cache} = selectActivityState(globalState);
  if (guid && cache && cache[guid]) {
    try {
      yield call(performPost, BULK_UPLOAD_URL, cache[guid]);
      yield put(createSyncedActivitiesEvent(guid));
      yield put(createSyncedDataEvent());
    } catch (e) {
      yield put(
        createShowWarningNotificationEvent(
          'Unable to sync activity data! Try again later, please.',
        ),
      );
    }
  }
}
