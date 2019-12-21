import {call, put, select} from 'redux-saga/effects';
import {isOnline} from '../NetworkSagas';
import {CachedObjective, Objective} from '../../types/StrategyTypes';
import {performDelete, performPost, performPut} from '../APISagas';
import {
  createCachedObjectiveEvent,
  createSyncedObjectiveEvent,
} from '../../events/StrategyEvents';
import {selectUserState} from '../../reducers';
import {createCachedDataEvent} from '../../events/UserEvents';
import {PayloadEvent} from '../../events/Event';
import {EventTypes} from '../../types/EventTypes';

export function* objectiveCreationSaga({payload}: PayloadEvent<Objective>) {
  yield call(
    objectiveAPIInteractionSaga,
    payload,
    objectiveCreateSaga,
    objectiveUploadToCached,
  );
}

export function* objectiveChangesSaga({payload}: PayloadEvent<Objective>) {
  yield call(
    objectiveAPIInteractionSaga,
    payload,
    objectiveUpdateSaga,
    objectiveUpdateToCached,
  );
}

export function* objectiveTerminationSaga({payload}: PayloadEvent<Objective>) {
  yield call(
    objectiveAPIInteractionSaga,
    payload,
    objectiveDeleteSaga,
    objectiveDeleteToCached,
  );
}

export function* objectiveCompletionSaga({payload}: PayloadEvent<Objective>) {
  yield call(
    objectiveAPIInteractionSaga,
    payload,
    objectiveCompleteSaga,
    objectiveCompleteToCached,
  );
}

export function* objectiveCreateSaga(objective: Objective) {
  yield call(
    objectiveUploadSaga,
    objective,
    performPost,
    objectiveUploadToCached,
  );
}

export function* objectiveUpdateSaga(objective: Objective) {
  yield call(
    objectiveUploadSaga,
    objective,
    performPut,
    objectiveUpdateToCached,
  );
}

export function* objectiveDeleteSaga(objective: Objective) {
  yield call(
    objectiveUploadSaga,
    objective,
    performDelete,
    objectiveDeleteToCached,
  );
}

export function* objectiveCompleteSaga(objective: Objective) {
  yield call(
    objectiveUploadSaga,
    objective,
    performPost,
    objectiveCompleteToCached,
    (_objective: Objective) => `${OBJECTIVES_URL}/${_objective.id}/complete`,
  );
}

export const objectiveUploadToCached: (
  objective: Objective,
) => CachedObjective = objective => ({
  objective,
  uploadType: EventTypes.CREATED,
});

export const objectiveUpdateToCached: (
  objective: Objective,
) => CachedObjective = objective => ({
  objective,
  uploadType: EventTypes.UPDATED,
});

export const objectiveDeleteToCached: (
  objective: Objective,
) => CachedObjective = objective => ({
  objective,
  uploadType: EventTypes.DELETED,
});

export const objectiveCompleteToCached: (
  objective: Objective,
) => CachedObjective = objective => ({
  objective,
  uploadType: EventTypes.COMPLETED,
});

export function* objectiveAPIInteractionSaga(
  objective: Objective,
  objectiveSaga: (o: Objective) => any,
  cachedObjectiveFunction: (objective: Objective) => CachedObjective,
) {
  const onlineStatus = yield call(isOnline);
  if (onlineStatus) {
    yield call(objectiveSaga, objective);
  } else {
    yield call(cacheObjectiveSaga, cachedObjectiveFunction(objective));
  }
}

export const OBJECTIVES_URL = '/strategy/objectives';

export function* objectiveUploadSaga(
  objective: Objective,
  apiAction: (u: string, o: Objective) => any,
  cachingFunction: (objective: Objective) => CachedObjective,
  urlFunction: (objective: Objective) => string = __ => OBJECTIVES_URL,
) {
  try {
    yield call(apiAction, urlFunction(objective), objective);
    yield put(createSyncedObjectiveEvent(objective));
  } catch (e) {
    yield call(cacheObjectiveSaga, cachingFunction(objective));
  }
}

export function* cacheObjectiveSaga(objective: CachedObjective) {
  const {
    information: {guid},
  } = yield select(selectUserState);
  yield put(
    createCachedObjectiveEvent({
      userGUID: guid,
      objective,
    }),
  );
  yield put(createCachedDataEvent());
}
