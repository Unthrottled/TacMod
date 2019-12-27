import {call, all, fork, put, race, select, take} from 'redux-saga/effects';
import {eventChannel} from 'redux-saga';
import {
  createFoundInternetEvent,
  createFoundWifiEvent,
  createLostInternetEvent,
  createLostWifiEvent,
  FOUND_WIFI,
} from '../events/NetworkEvents';
import {selectNetworkState} from '../reducers';
import {
  FAILED_RECEPTION_INITIAL_CONFIGURATION,
  RECEIVED_PARTIAL_INITIAL_CONFIGURATION,
} from '../events/ConfigurationEvents';
import NetInfo from '@react-native-community/netinfo';

export const createNetworkChannel = () => {
  return eventChannel(statusObserver => {
    NetInfo.addEventListener(state => {
      statusObserver(state.isConnected);
    });
    return () => {};
  });
};

function* onlineSaga() {
  const onlineEventChannel = yield call(createNetworkChannel);
  try {
    while (true) {
      const hasWifi = yield take(onlineEventChannel);
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
  const {isOnline} = yield select(selectNetworkState);
  return isOnline;
}

export function* waitForWifi() {
  const {isOnline} = yield select(selectNetworkState);
  if (!isOnline) {
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
  const hasInternet = yield checkInternet();
  if (hasInternet) {
    yield put(createFoundInternetEvent());
  } else {
    yield put(createLostInternetEvent());
  }
}

function* checkInternet() {
  const {worked} = yield race({
    worked: take(RECEIVED_PARTIAL_INITIAL_CONFIGURATION),
    didNot: take(FAILED_RECEPTION_INITIAL_CONFIGURATION),
  });

  return !!worked;
}

function* listenToNetworkEvents() {
  yield fork(initialNetworkStateSaga);
  yield fork(initialInternetStateSaga);
  yield fork(onlineSaga);
}

export default function* rootSaga() {
  yield all([listenToNetworkEvents()]);
}
