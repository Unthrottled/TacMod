import {call, put, select} from 'redux-saga/effects';
import {isOnline} from '../NetworkSagas';
import {performDelete, performPost, performPut} from '../APISagas';
import {selectUserState} from '../../reducers';
import {createCachedDataEvent} from '../../events/UserEvents';
import {CachedTacticalActivity, TacticalActivity,} from '../../types/TacticalTypes';
import {
  createCachedTacticalActivityEvent,
  createDeletedTacticalActivityEvent,
  createSyncedTacticalActivityEvent,
} from '../../events/TacticalEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';
import {BULK_ACTIVITY_UPLOAD_URL} from './TacticalActivitySyncSaga';
import {removalReRankSaga} from './TacticalActivityVisibilitySagas';
import {PayloadEvent} from '../../events/Event';
import {EventTypes} from '../../types/EventTypes';

export function* activityCreationSaga({
                                        payload,
                                      }: PayloadEvent<TacticalActivity>) {
  yield call(
    activityAPIInteractionSaga,
    payload,
    activityCreateSaga,
    activityUploadToCached,
  );
}

export function* activityChangesSaga({
                                       payload,
                                     }: PayloadEvent<TacticalActivity>) {
  yield call(
    activityAPIInteractionSaga,
    payload,
    activityUpdateSaga,
    activityUpdateToCached,
  );
}

export function* activityRankSaga({payload}: PayloadEvent<TacticalActivity[]>) {
  try {
    yield call(performPut, BULK_ACTIVITY_UPLOAD_URL, payload);
  } catch (e) {
    yield put(
      createShowWarningNotificationEvent(
        'Unable to update activity rank! Try again later, please.',
      ),
    );
    for (const tacticalActivity in payload) {
      if (payload.hasOwnProperty(tacticalActivity)) {
        yield call(
          cacheTacticalActivitySaga,
          activityUpdateToCached(payload[tacticalActivity]),
        );
      }
    }
  }
}

export function* activityTerminationSaga({
                                           payload,
                                         }: PayloadEvent<TacticalActivity>) {
  yield call(
    activityAPIInteractionSaga,
    payload,
    activityDeleteSaga,
    activityDeleteToCached,
  );
  yield call(removalReRankSaga, payload);
  yield put(createDeletedTacticalActivityEvent(payload));
}

export function* activityCreateSaga(activity: TacticalActivity) {
  yield call(activityUploadSaga, activity, performPost, activityUploadToCached);
}

export function* activityUpdateSaga(activity: TacticalActivity) {
  yield call(activityUploadSaga, activity, performPut, activityUpdateToCached);
}

export function* activityDeleteSaga(activity: TacticalActivity) {
  yield call(
    activityUploadSaga,
    activity,
    performDelete,
    activityDeleteToCached,
  );
}

export function* activityCompleteSaga(activity: TacticalActivity) {
  yield call(
    activityUploadSaga,
    activity,
    performPost,
    activityCompleteToCached,
    (_activity: TacticalActivity) =>
      `${TACTICAL_ACTIVITIES_URL}/${_activity.id}/complete`,
  );
}

export const activityUploadToCached: (
  tacticalActivity: TacticalActivity,
) => CachedTacticalActivity = activity => ({
  activity,
  uploadType: EventTypes.CREATED,
});

export const activityUpdateToCached: (
  tacticalActivity: TacticalActivity,
) => CachedTacticalActivity = activity => ({
  activity,
  uploadType: EventTypes.UPDATED,
});

export const activityDeleteToCached: (
  tacticalActivity: TacticalActivity,
) => CachedTacticalActivity = activity => ({
  activity,
  uploadType: EventTypes.DELETED,
});

export const activityCompleteToCached: (
  tacticalActivity: TacticalActivity,
) => CachedTacticalActivity = activity => ({
  activity,
  uploadType: EventTypes.COMPLETED,
});

export function* activityAPIInteractionSaga(
  activity: TacticalActivity,
  activitySaga: (a: TacticalActivity) => void,
  cachedTacticalActivityFunction: (
    tacticalActivity: TacticalActivity,
  ) => CachedTacticalActivity,
) {
  const onlineStatus = yield call(isOnline);
  if (onlineStatus) {
    yield call(activitySaga, activity);
  } else {
    yield call(
      cacheTacticalActivitySaga,
      cachedTacticalActivityFunction(activity),
    );
  }
}

export const TACTICAL_ACTIVITIES_URL = '/tactical/activity';

export function* activityUploadSaga(
  activity: TacticalActivity,
  apiAction: any,
  cachingFunction: (
    tacticalActivity: TacticalActivity,
  ) => CachedTacticalActivity,
  urlFunction: (tacticalActivity: TacticalActivity) => string = __ =>
    TACTICAL_ACTIVITIES_URL,
) {
  try {
    yield call(apiAction, urlFunction(activity), activity);
    yield put(createSyncedTacticalActivityEvent(activity));
  } catch (e) {
    yield call(cacheTacticalActivitySaga, cachingFunction(activity));
  }
}

export function* cacheTacticalActivitySaga(
  cachedActivity: CachedTacticalActivity,
) {
  const {
    information: {guid},
  } = yield select(selectUserState);
  yield put(
    createCachedTacticalActivityEvent({
      userGUID: guid,
      cachedActivity,
    }),
  );
  yield put(createCachedDataEvent());
}
