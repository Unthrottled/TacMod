import {all, call, flush, fork, put, select, take, takeEvery,} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {
  createFoundInternetEvent,
  createFoundWifiEvent,
  createLostInternetEvent,
  createLostWifiEvent,
  FOUND_WIFI,
} from '../events/NetworkEvents';
import {selectNetworkState} from '../reducers';
import NetInfo from '@react-native-community/netinfo';
import {FOCUSED_APPLICATION} from '../events/ApplicationLifecycleEvents';
import {getInitialUIConfig} from './configuration/InitialConfigurationSagas';

export const createNetworkChannel = () => {
  return eventChannel(statusObserver => {
    NetInfo.addEventListener(state => {
      statusObserver(state.isConnected);
    });
    return () => {
    };
  }, buffers.expanding(100));
};

function* onlineSaga() {
  const onlineEventChannel = yield call(createNetworkChannel);
  try {
    while (true) {
      const hasWifi = yield take(onlineEventChannel);
      yield flush(onlineEventChannel);
      if (hasWifi) {
        yield put(createFoundWifiEvent());
      } else {
        yield put(createLostWifiEvent());
      }
    }
  } catch (e) {
    console.log('shit broke in online saga', e);
  }
}

export function* isOnline() {
  const {isOnline: iO} = yield select(selectNetworkState);
  return iO;
}

export function* waitForWifi() {
  const {isOnline: iO} = yield select(selectNetworkState);
  if (!iO) {
    yield take(FOUND_WIFI);
  }
}

function* initialNetworkStateSaga() {
  const netState = yield call(NetInfo.fetch);
  if (netState.isConnected) {
    yield put(createFoundWifiEvent());
  } else {
    yield put(createLostWifiEvent());
  }
}

function* initialInternetStateSaga() {
  const hasInternet = yield call(checkInternet);
  if (hasInternet) {
    yield put(createFoundInternetEvent());
  } else {
    yield put(createLostInternetEvent());
  }
}

function* checkInternet() {
  try {
    yield call(getInitialUIConfig);
    return true;
  } catch (e) {
    return false;
  }
}

function* listenToNetworkEvents() {
  yield fork(onlineSaga);
  yield takeEvery(FOCUSED_APPLICATION, initialInternetStateSaga);
}

export default function* rootSaga() {
  yield all([listenToNetworkEvents()]);
}
