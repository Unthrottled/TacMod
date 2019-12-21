import {call, put, select, take} from 'redux-saga/effects';
import {
  createReceivedOAuthConfigurations,
  RECEIVED_REMOTE_OAUTH_CONFIGURATION,
} from '../../events/ConfigurationEvents';
import {createOauthConfigurationObject} from '../../security/StupidShit';
import {selectConfigurationState} from '../../reducers';

export function* securityRequestSaga() {
  const oauthConfig = yield call(fetchOAuthConfiguration);
  yield put(createReceivedOAuthConfigurations(oauthConfig));
}

export function* fetchOAuthConfiguration() {
  const {oauth} = yield select(selectConfigurationState);
  if (!oauth.authorizationEndpoint) {
    const {payload} = yield take(RECEIVED_REMOTE_OAUTH_CONFIGURATION);
    return payload;
  } else {
    return createOauthConfigurationObject(oauth);
  }
}
