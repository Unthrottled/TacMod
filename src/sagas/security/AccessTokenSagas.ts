import {call, fork, race, select, take} from 'redux-saga/effects';
import {
  FAILED_TO_RECEIVE_TOKEN,
  RECEIVED_TOKENS,
} from '../../events/SecurityEvents';
import {canRefreshToken} from '../../security/OAuth';
import {
  refreshTokenWithoutReplacementSaga,
  refreshTokenWithReplacementSaga,
} from './RefreshTokenSagas';
import {SessionExpiredException} from '../../types/SecurityTypes';
import {SecurityState} from '../../reducers/SecurityReducer';
import {selectSecurityState} from '../../reducers';
import {oauthConfigurationSaga} from '../configuration/ConfigurationConvienenceSagas';

export function* accessTokenWithSessionExtensionSaga() {
  return yield call(
    accessTokenSagas,
    getOrRefreshAccessTokenWithSessionExtension,
  );
}

export function* accessTokenWithoutSessionExtensionSaga() {
  return yield call(
    accessTokenSagas,
    getOrRefreshAccessTokenWithoutSessionExtension,
  );
}

export function* accessTokenSagas(getOrRefreshAccessTokenSaga: () => any) {
  const accessToken = yield call(getOrRefreshAccessTokenSaga);
  if (accessToken) {
    return accessToken;
  } else {
    throw new SessionExpiredException();
  }
}

export function* getOrRefreshAccessTokenWithSessionExtension() {
  return yield call(
    getOrRefreshAccessToken,
    refreshTokenWithReplacementSaga,
    canRefreshToken,
  );
}

export function* getOrRefreshAccessTokenWithoutSessionExtension() {
  return yield call(
    getOrRefreshAccessToken,
    refreshTokenWithoutReplacementSaga,
    canRefreshToken,
  );
}

export function* getOrRefreshAccessToken(
  refreshTokenSaga: (arg0: any, arg2: any) => any,
  shouldTokenRefresh: (arg0: SecurityState) => boolean,
) {
  const security: SecurityState = yield select(selectSecurityState);
  if (shouldTokenRefresh(security)) {
    const oauthConfiguration = yield call(oauthConfigurationSaga);
    yield fork(refreshTokenSaga, oauthConfiguration, security);
    return yield call(awaitToken);
  } else {
    return security.accessToken;
  }
}

export function* awaitToken() {
  const {tokenReception} = yield race({
    tokenReception: take(RECEIVED_TOKENS),
    tokenFailure: take(FAILED_TO_RECEIVE_TOKEN),
  });
  const {payload} = tokenReception || {};
  const {accessToken} = payload || {};
  return accessToken;
}
