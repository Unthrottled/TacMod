import {
  createCheckedAuthorizationEvent,
  createTokenReceptionEvent,
} from '../../events/SecurityEvents';
import {call, put, take} from 'redux-saga/effects';
import {
  createRequestForInitialConfigurations,
  FOUND_INITIAL_CONFIGURATION,
} from '../../events/ConfigurationEvents';
import {authorize} from 'react-native-app-auth';

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
      const authState = yield call(authorize, initialConfigurations);
      yield put(createTokenReceptionEvent(authState));
    } catch (e) {
      // todo: handle login failure
    }
  }
}
