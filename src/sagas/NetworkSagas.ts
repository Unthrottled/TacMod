import {all, call, fork, put, race, select, take} from 'redux-saga/effects';
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

// todo: make online work
export const createOnlineChannel = () => createNetworkChannel('online');
export const createOfflineChannel = () => createNetworkChannel('offline');

export const createNetworkChannel = (event: string) => {
  return eventChannel(statusObserver => {
    const statusHandler = (status: any) => statusObserver(status);
    window.addEventListener(event, statusHandler);
    return () => window.removeEventListener(event, statusHandler);
  });
};

function* onlineSaga() {
  // const onlineEventChannel = yield call(createOnlineChannel);
  try {
    // while (true) {
    //   yield take(onlineEventChannel);
    yield put(createFoundWifiEvent());
    // }
  } catch (e) {
    console.log('shit broke in online saga', e);
  }
}

function* offlineSaga(): any {
  // const onlineEventChannel = yield call(createOfflineChannel);
  // try {
  //   while (true) {
  //     yield take(onlineEventChannel);
  //     yield put(createLostWifiEvent());
  //   }
  // } catch (e) {
  //   yield fork(offlineSaga);
  // }
}

export function* isOnline() {
  const {isOnline} = yield select(selectNetworkState);
  return isOnline;
}

export function* waitForWifi() {
  const {isOnline} = yield select(selectNetworkState);
  // if (!isOnline) {
  //   yield take(FOUND_WIFI);
  // }
}

function* initialNetworkStateSaga() {
  if (navigator.onLine) {
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
  yield fork(offlineSaga);
}

export default function* rootSaga() {
  yield all([listenToNetworkEvents()]);
}
