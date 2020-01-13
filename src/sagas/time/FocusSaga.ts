import {call, put, select, take} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {AppState} from 'react-native';
import {createAppGainedFocusEvent} from '../../events/ApplicationLifecycleEvents';
import {selectMiscState} from '../../reducers';

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

export function* waitForHydration() {
  const {hydrated} = yield select(selectMiscState);
  if (!hydrated) {
    yield take('persist/REHYDRATE');
  }
}

export function* focusSaga() {
  const focusChannel = createFocusChannel();
  while (true) {
    yield take(focusChannel);
    yield call(waitForHydration);
    yield put(createAppGainedFocusEvent());
  }
}
