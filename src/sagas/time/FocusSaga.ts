import {debounce, flush, call, put, select, take} from 'redux-saga/effects';
import {buffers, eventChannel} from 'redux-saga';
import {AppState} from 'react-native';
import {createAppGainedFocusEvent} from '../../events/ApplicationLifecycleEvents';
import {selectMiscState} from '../../reducers';

export const createFocusChannel = () => {
  return eventChannel(statusObserver => {
    const listener = (nextState: string) => {
      if (nextState === 'active') {
        console.log('yeet!')
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

export function* performFocusEvents(focusChannel: any){
  yield flush(focusChannel);
  yield call(waitForHydration);
  yield put(createAppGainedFocusEvent());
  console.warn('focused!')
}

export function* focusSaga() {
  console.warn('setting up focus!')
  const focusChannel: any = createFocusChannel();
  yield debounce(300, focusChannel, performFocusEvents, focusChannel);
}
