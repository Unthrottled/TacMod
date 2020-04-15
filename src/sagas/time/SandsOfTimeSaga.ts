import {GlobalState, selectActivityState} from '../../reducers';
import {call, fork, race, select, take} from 'redux-saga/effects';
import {ActivityTimedType} from '../../types/ActivityTypes';
import {
  INITIALIZED_CURRENT_ACTIVITY,
  RESUMED_TIMED_ACTIVITY,
  STARTED_TIMED_ACTIVITY,
} from '../../events/ActivityEvents';
import {pomodoroSaga} from './PomodoroSaga';
import {stopWatchSaga} from './StopwatchSaga';

const extractState = (state: GlobalState) => {
  const {shouldTime} = selectActivityState(state);
  return {
    shouldTime,
  };
};

export function* sandsOfTimeSaga() {
  do {
    const currentActivity = yield call(waitForCurrentActivity);
    const {shouldTime} = yield select(extractState);
    const {
      content: {timedType},
    } = currentActivity;
    const isTimer = timedType === ActivityTimedType.TIMER;
    if (shouldTime) {
      if (isTimer) {
        yield fork(pomodoroSaga, currentActivity);
      } else {
        yield fork(stopWatchSaga, currentActivity);
      }
    }
  } while (true);
}

export function* waitForCurrentActivity() {
  const {firstActivity, newActivity, userActivity} = yield race({
    firstActivity: take(INITIALIZED_CURRENT_ACTIVITY),
    newActivity: take(RESUMED_TIMED_ACTIVITY),
    userActivity: take(STARTED_TIMED_ACTIVITY),
  });

  return firstActivity
    ? firstActivity.payload
    : newActivity
      ? newActivity.payload
      : userActivity.payload;
}
