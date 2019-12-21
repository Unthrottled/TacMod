import {call, put, take} from 'redux-saga/effects';
import {createInitializedPomodoroEvent} from '../../events/ActivityEvents';
import {performGet} from '../APISagas';
import {RECEIVED_USER} from '../../events/UserEvents';

export const ONE_DAY = 24 * 60 * 60 * 1000;

export function* pomodoroActivityInitializationSaga() {
  yield take(RECEIVED_USER);
  const meow = new Date().valueOf();
  const count = yield call(getCount);
  yield put(
    createInitializedPomodoroEvent({
      count,
      dateCounted: meow,
    }),
  );
}

export function* getCount() {
  const {data} = yield call(performGet, '/activity/pomodoro/count');
  return data ? data.count : 0;
}
