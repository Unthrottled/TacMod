import {call, put, select, take} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {ActivityTimedType} from '../../types/ActivityTypes';
import {extractStartTime} from './StopwatchSaga';
import {GlobalState, selectActivityState} from '../../reducers';
import {createTimeSetEvent} from '../../events/TimeEvents';

export const createFocusChannel = () => {
  return eventChannel(statusObserver => {
    const listener = () => {
      statusObserver(true);
    };
    window.addEventListener('focus', listener);
    return () => window.removeEventListener('focus', listener);
  }, buffers.expanding(100));
};

function* updateTime() {
  const {shouldTime, currentActivity} = yield select(
    (globalState: GlobalState) => {
      const {shouldTime, currentActivity} = selectActivityState(globalState);
      return {
        shouldTime,
        currentActivity,
      };
    },
  );
  const {
    content: {timedType},
  } = currentActivity;
  const isTimer = timedType === ActivityTimedType.TIMER;
  if (shouldTime) {
    const delta = Math.floor(
      (new Date().valueOf() - extractStartTime(currentActivity)) / 1000,
    );
    if (isTimer) {
      // todo: update pomodoro, maybe?
    } else {
      yield put(createTimeSetEvent(delta));
    }
  }
}

export function* focusSaga() {
  const focusChannel = createFocusChannel();
  while (true) {
    yield take(focusChannel);
    yield call(updateTime);
  }
}
