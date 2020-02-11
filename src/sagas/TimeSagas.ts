import {all, fork} from 'redux-saga/effects';
import {sandsOfTimeSaga} from './time/SandsOfTimeSaga';
import {focusSaga} from './time/FocusSaga';
import ReactNativeAN from 'react-native-alarm-notification';
import {DeviceEventEmitter} from 'react-native';

function* startTimeSagas() {
  yield fork(sandsOfTimeSaga);
  yield fork(focusSaga);

  DeviceEventEmitter.addListener('OnNotificationDismissed', () =>
    ReactNativeAN.stopAlarm(),
  );
  DeviceEventEmitter.addListener('OnNotificationOpened', () =>
    ReactNativeAN.stopAlarm(),
  );
}

export default function* rootSaga() {
  yield all([startTimeSagas()]);
}
