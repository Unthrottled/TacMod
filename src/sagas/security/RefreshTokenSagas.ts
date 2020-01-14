import {call, put, select} from 'redux-saga/effects';
import {waitForWifi} from '../NetworkSagas';
import {
  AuthConfiguration,
  AuthorizeResult,
  refresh,
} from 'react-native-app-auth';
import {
  createExpiredSessionEvent,
  createRequestingTokenEvent,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';
import {selectSecurityState} from '../../reducers';
import {SecurityState} from '../../reducers/SecurityReducer';
import {isAccessTokenValid} from '../../security/OAuth';

export function* refreshTokenSaga(oauthConfig: AuthConfiguration) {
  yield call(waitForWifi);
  try {
    const realSecurityState: SecurityState = yield select(selectSecurityState);
    if (
      !realSecurityState.isRequestingToken &&
      !isAccessTokenValid(realSecurityState)
    ) {
      yield put(createRequestingTokenEvent());
      const authResult = yield call(refresh, oauthConfig, {
        refreshToken: realSecurityState.refreshToken,
      });
      const withOfflineToken: AuthorizeResult = {
        ...authResult,
        refreshToken: realSecurityState.refreshToken,
      };
      yield put(createTokenReceptionEvent(withOfflineToken));
    }
  } catch (e) {
    yield put(createExpiredSessionEvent()); // credentials are not good, just ask logon again please
  }
}

export function* refreshTokenWithReplacementSaga(
  oauthConfig: AuthConfiguration,
) {
  yield call(refreshTokenSaga, oauthConfig);
}
