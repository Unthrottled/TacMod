import {all, fork, takeEvery} from 'redux-saga/effects';
import {sandsOfTimeSaga} from './time/SandsOfTimeSaga';
import {focusSaga} from './time/FocusSaga';
import {CANCELED_POMODORO} from '../events/ActivityEvents';
import {stopPomodoro} from './time/PomodoroSaga';

function* startTimeSagas() {
  yield fork(sandsOfTimeSaga);
  yield fork(focusSaga);
  yield takeEvery(CANCELED_POMODORO, stopPomodoro);
}


export default function* rootSaga() {
  yield all([startTimeSagas()]);
}
