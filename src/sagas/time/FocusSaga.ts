import {call, take} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {AppState} from 'react-native';
import {updateCurrentActivity} from '../activity/CurrentActivitySaga';

let previousState = 'background';

export const createFocusChannel = () => {
  return eventChannel(statusObserver => {
    const listener = (nextState: string) => {
      if (
        previousState.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        statusObserver(true);
      }
      previousState = nextState;
    };
    AppState.addEventListener('change', listener);
    return () => {
      AppState.removeEventListener('change', listener);
    };
  }, buffers.expanding(100));
};

export function* focusSaga() {
  const focusChannel = createFocusChannel();
  while (true) {
    yield take(focusChannel);
    yield call(updateCurrentActivity);
  }
}
