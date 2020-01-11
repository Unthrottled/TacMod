import {put, call, take} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {AppState} from 'react-native';
import {updateCurrentActivity} from '../activity/CurrentActivitySaga';
import {createAppGainedFocusEvent} from '../../events/ApplicationLifecycleEvents';

export const createFocusChannel = () => {
  return eventChannel(statusObserver => {
    const listener = (nextState: string) => {
      if (nextState === 'active') {
        statusObserver(true);
      }
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
    yield put(createAppGainedFocusEvent());
    yield call(updateCurrentActivity);
  }
}
