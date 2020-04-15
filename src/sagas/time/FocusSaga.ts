import {call, flush, put, select, take, takeEvery} from 'redux-saga/effects';
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

export function* performFocusEvents(focusChannel: any) {
  yield flush(focusChannel);
  yield call(waitForHydration);
  yield put(createAppGainedFocusEvent());
}

export function* focusSaga() {
  const focusChannel: any = createFocusChannel();
  yield takeEvery(focusChannel, performFocusEvents, focusChannel);
}
