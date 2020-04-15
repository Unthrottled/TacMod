import {put, select, take} from 'redux-saga/effects';
import {shouldCheckForAuthorizationGrant} from '../../security/OAuth';
import {CHECKED_AUTH, createSecurityInitializedEvent,} from '../../events/SecurityEvents';

function* oauthInitializationSaga() {
  const {security} = yield select();
  if (shouldCheckForAuthorizationGrant(security)) {
    yield take(CHECKED_AUTH); // wait until checked
  }
  yield put(createSecurityInitializedEvent());
}

export default oauthInitializationSaga;
