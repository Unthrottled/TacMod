import {call, put, select} from 'redux-saga/effects';
import {waitForWifi} from '../NetworkSagas';
import {AuthConfiguration, AuthorizeResult, refresh,} from 'react-native-app-auth';
import {
  createExpiredSessionEvent,
  createTokenFailureEvent,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';
import {selectSecurityState} from '../../reducers';
import {SecurityState} from '../../reducers/SecurityReducer';
import {isAccessTokenValid} from '../../security/OAuth';

let tokenSemaphore = false;

export function* refreshTokenSaga(oauthConfig: AuthConfiguration) {
  yield call(waitForWifi);
  try {
    const realSecurityState: SecurityState = yield select(selectSecurityState);
    if (!tokenSemaphore && !isAccessTokenValid(realSecurityState)) {
      tokenSemaphore = true;
      const authResult = yield call(refresh, oauthConfig, {
        refreshToken: realSecurityState.refreshToken,
      });
      const withOfflineToken: AuthorizeResult = {
        ...authResult,
        refreshToken: realSecurityState.refreshToken,
      };
      yield put(createTokenReceptionEvent(withOfflineToken));
      tokenSemaphore = false;
    }
  } catch (e) {
    yield put(createExpiredSessionEvent()); // credentials are not good, just ask logon again please

    // Should probably remove this, but lets others know that
    // token reception failed.
    yield put(
      createTokenFailureEvent({
        error: e,
      }),
    );
  }
}

export function* refreshTokenWithReplacementSaga(
  oauthConfig: AuthConfiguration,
) {
  yield call(refreshTokenSaga, oauthConfig);
}
