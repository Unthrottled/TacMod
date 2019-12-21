import {put, select, take} from 'redux-saga/effects';
import {shouldCheckForAuthorizationGrant} from '../../security/OAuth';
import {
  CHECKED_AUTH,
  createSecurityInitializedEvent,
  requestAuthorizationGrantCheck,
} from '../../events/SecurityEvents';
import {OAuthConfig} from '../../types/ConfigurationTypes';

function* oauthInitializationSaga(oauthConfig: OAuthConfig) {
  const {security} = yield select();
  if (shouldCheckForAuthorizationGrant(security)) {
    yield put(requestAuthorizationGrantCheck(oauthConfig)); // ask to check if there is an authorization grant.
    yield take(CHECKED_AUTH); // wait until checked
  }
  yield put(createSecurityInitializedEvent());
}

export default oauthInitializationSaga;
