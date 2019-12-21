import {SecurityState} from '../../reducers/SecurityReducer';
import {call, put} from 'redux-saga/effects';
import {waitForWifi} from '../NetworkSagas';
import {AuthConfiguration, refresh} from 'react-native-app-auth';
import {
  createExpiredSessionEvent,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';

export function* refreshTokenSaga(
  oauthConfig: AuthConfiguration,
  securityState: SecurityState,
) {
  yield call(waitForWifi);
  try {
    const authResult = yield call(refresh, oauthConfig, {
      refreshToken: securityState.refreshToken,
    });
    yield put(createTokenReceptionEvent(authResult)); //todo: is this right??
  } catch (e) {
    yield put(createExpiredSessionEvent()); // credentials are not good, just ask logon again please
  }
}

export function* refreshTokenWithReplacementSaga(
  oauthConfig: AuthConfiguration,
  securityState: SecurityState,
) {
  yield call(refreshTokenSaga, oauthConfig, securityState);
}
