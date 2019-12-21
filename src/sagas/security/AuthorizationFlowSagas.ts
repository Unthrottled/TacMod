import {
  createCheckedAuthorizationEvent, createLoggedOnAction,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';
import {call, put, take} from 'redux-saga/effects';
import {
  createRequestForInitialConfigurations,
  FOUND_INITIAL_CONFIGURATION,
} from '../../events/ConfigurationEvents';
import {AuthConfiguration, authorize} from 'react-native-app-auth';

export function* authorizationGrantSaga() {
  yield call(performAuthorizationGrantFlowSaga, false);
  yield put(createCheckedAuthorizationEvent());
}

export function* loginSaga() {
  yield call(performAuthorizationGrantFlowSaga, true);
}

export function* performAuthorizationGrantFlowSaga(
  shouldRequestLogon: boolean,
) {
  if (shouldRequestLogon) {
    const scope = 'openid profile email';
    yield put(createRequestForInitialConfigurations());
    const {payload: initialConfigurations} = yield take(
      FOUND_INITIAL_CONFIGURATION,
    );
    try {
      const authConfigurations: AuthConfiguration = {
        issuer: initialConfigurations.issuer,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        redirectUrl: 'io.acari.sogos:/engage',
        additionalParameters: {
          prompt: 'login',
        },
        clientId: 'sogos-app',
        dangerouslyAllowInsecureHttpRequests: true, //todo: remove dis
      };
      const authState = yield call(authorize, authConfigurations);
      yield put(createTokenReceptionEvent(authState));
      yield put(createLoggedOnAction());
    } catch (e) {
      // todo: handle login failure
    }
  }
}
