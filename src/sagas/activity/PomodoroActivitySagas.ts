import {call, put} from 'redux-saga/effects';
import moment from 'moment';
import {createInitializedPomodoroEvent} from '../../events/ActivityEvents';
import {performGet} from '../APISagas';

export const ONE_DAY = 24 * 60 * 60 * 1000;

export function* pomodoroActivityInitializationSaga() {
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
  const meow = moment();
  try {
    const {data} = yield call(
      performGet,
      `/activity/pomodoro/current/count?from=${meow
        .startOf('day')
        .unix()}000&to=${meow.endOf('day').unix()}000`,
    );
    return data ? data.count : 0;
  } catch (e) {
    return 0;
  }
}
