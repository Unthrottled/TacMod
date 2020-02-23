import {all, fork, takeEvery} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {sandsOfTimeSaga} from './time/SandsOfTimeSaga';
import {focusSaga} from './time/FocusSaga';
import {CANCELED_POMODORO} from '../events/ActivityEvents';
import {newPomodoroSaga, stopAllAlarms} from './time/PomodoroSaga';
import {NativeEventEmitter, NativeModules} from 'react-native';

function* startTimeSagas() {
  yield fork(sandsOfTimeSaga);
  yield fork(focusSaga);
  yield takeEvery(CANCELED_POMODORO, stopAllAlarms);
  yield takeEvery(createAlarmedTriggeredChannel(), newPomodoroSaga);
}

function createAlarmedTriggeredChannel() {
  return eventChannel(statusObserver => {
    const eventEmitter = new NativeEventEmitter(NativeModules.Alarm);
    const listener = () => {
      statusObserver('next!');
    };
    eventEmitter.addListener('AlarmTriggered', listener);
    return () => eventEmitter.removeListener('AlarmedTriggered', listener);
  }, buffers.expanding(100));
}

export default function* rootSaga() {
  yield all([startTimeSagas()]);
}
