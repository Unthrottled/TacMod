import {all, call, delay, takeEvery, put} from 'redux-saga/effects';
import {
  createSyncedTacModDownloadedEvent,
  RECEIVED_USER,
} from '../events/UserEvents';
import {PayloadEvent} from '../events/Event';
import {UserResponse} from '../types/UserTypes';
import {performPost} from './APISagas';

function* initialWalkThroughSaga({payload: user}: PayloadEvent<UserResponse>) {
  const onboarding = user.misc.onboarding;
  if (!onboarding || (onboarding && !onboarding.TacModDownloaded)) {
    // thank user for being awesome!!
    yield call(tacModDownloadedSaga, {});
  }
}

function* tacModDownloadedSaga(_: any, attempt = 10): Generator {
  try {
    yield call(performPost, '/user/onboarding/TacMod/downloaded', {});
    yield put(createSyncedTacModDownloadedEvent());
  } catch (e) {
    yield delay(Math.pow(2, attempt) + Math.floor(Math.random() * 1000));
    yield call(tacModDownloadedSaga, {}, attempt < 13 ? attempt + 1 : 10);
  }
}

function* setUpOnboardingSagas() {
  yield takeEvery(RECEIVED_USER, initialWalkThroughSaga);
}

export default function* rootSaga() {
  yield all([setUpOnboardingSagas()]);
}
