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
import {oauthConfigurationSaga} from "../configuration/ConfigurationConvienenceSagas";

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
    yield put(createRequestForInitialConfigurations());
    const oAuthConfig = yield call(oauthConfigurationSaga);
    try {
      const authState = yield call(authorize, oAuthConfig);
      yield put(createTokenReceptionEvent(authState));
      yield put(createLoggedOnAction());
    } catch (e) {
      // todo: handle login failure
    }
  }
}
