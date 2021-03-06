import {
  createCheckedAuthorizationEvent,
  createLoggedOnAction,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';
import {call, put} from 'redux-saga/effects';
import {createRequestForInitialConfigurations} from '../../events/ConfigurationEvents';
import {authorize} from 'react-native-app-auth';
import {oauthConfigurationSaga} from '../configuration/ConfigurationConvienenceSagas';
import {createApplicationUnInitializedEvent} from '../../events/ApplicationLifecycleEvents';

export function* loginSaga() {
  yield call(performAuthorizationGrantFlowSaga);
  yield put(createCheckedAuthorizationEvent());
}

export function* performAuthorizationGrantFlowSaga() {
  yield put(createRequestForInitialConfigurations());
  const oAuthConfig = yield call(oauthConfigurationSaga);
  try {
    yield put(createApplicationUnInitializedEvent());
    const authState = yield call(authorize, oAuthConfig);
    yield put(createTokenReceptionEvent(authState));
    yield put(createLoggedOnAction());
  } catch (e) {
    // todo: handle login failure
    console.error(e);
  }
}
