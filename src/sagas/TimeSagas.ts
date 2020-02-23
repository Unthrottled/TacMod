import {all, fork} from 'redux-saga/effects';
import {sandsOfTimeSaga} from './time/SandsOfTimeSaga';
import {focusSaga} from './time/FocusSaga';

function* startTimeSagas() {
  yield fork(sandsOfTimeSaga);
  yield fork(focusSaga);
}

export default function* rootSaga() {
  yield all([startTimeSagas()]);
}
