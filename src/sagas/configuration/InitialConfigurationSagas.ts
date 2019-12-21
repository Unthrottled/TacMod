import {performFullOpenGet, performOpenGet} from '../APISagas';
import {
  createFailedToGetInitialConfigurationsEvent,
  createFoundInitialConfigurationsEvent,
  createReceivedInitialConfigurationsEvent,
  createReceivedPartialInitialConfigurationsEvent,
  RECEIVED_INITIAL_CONFIGURATION,
} from '../../events/ConfigurationEvents';
import {call, put, select, take} from 'redux-saga/effects';
import {selectConfigurationState} from '../../reducers';
import {waitForWifi} from '../NetworkSagas';
import {createOutOfSyncEvent} from '../../events/ApplicationLifecycleEvents';

/**
 * Gets the configurations from the backend to know what authorization server to talk to.
 */
export function* initialConfigurationSaga() {
  try {
    yield call(waitForWifi);
    const {data: configData} = yield call(
      performFullOpenGet,
      '/config/initial.json',
    );
    const {
      data: {currentTime},
    } = yield call(performFullOpenGet, `${configData.apiURL}/time`);
    const meow = new Date().valueOf();
    if (meow - currentTime > 10000) {
      yield put(createOutOfSyncEvent());
    } else {
      yield put(createReceivedPartialInitialConfigurationsEvent(configData));
      const {data} = yield call(performOpenGet, '/configurations');
      yield put(
        createReceivedInitialConfigurationsEvent({
          ...data,
          callbackURI: `${window.location.protocol}//${
            window.location.hostname
          }${window.location.port ? ':' + window.location.port : ''}`,
        }),
      );
    }
  } catch (e) {
    yield put(createFailedToGetInitialConfigurationsEvent(e));
  }
}

export function* initialConfigurationFetchSaga() {
  const {initial} = yield select(selectConfigurationState);
  if (!initial.callbackURI) {
    const {payload: backendConfigurations} = yield take(
      RECEIVED_INITIAL_CONFIGURATION,
    );
    return backendConfigurations;
  }
  return initial;
}

export function* initialConfigurationResponseSaga() {
  const initialConfigurations = yield call(initialConfigurationFetchSaga);
  yield put(createFoundInitialConfigurationsEvent(initialConfigurations));
}
