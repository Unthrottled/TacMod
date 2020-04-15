import {call, put, select} from 'redux-saga/effects';
import {TacticalActivity} from '../../types/TacticalTypes';
import {
  createArchivedTacticalActivityEvent,
  createReRankedTacticalActivitiesEvent,
  createRestoredTacticalActivityEvent,
  createUpdatedTacticalActivityEvent,
} from '../../events/TacticalEvents';
import {selectTacticalActivityState} from '../../reducers';
import {TacticalActivityState} from '../../reducers/TacticalReducer';
import {numberObjectToArray} from '../../miscellanous/Tools';
import {PayloadEvent} from '../../events/Event';

export function* removalReRankSaga(tacticalActivity: TacticalActivity) {
  const tacticalActivityState: TacticalActivityState = yield select(
    selectTacticalActivityState,
  );
  const allTacticalActivities = numberObjectToArray(
    tacticalActivityState.activities,
  );

  const changedActivities = allTacticalActivities
    .splice(tacticalActivity.rank + 1, allTacticalActivities.length)
    .map(activity => {
      --activity.rank;
      return activity;
    });

  yield put(createReRankedTacticalActivitiesEvent(changedActivities));
}

export function* tacticalActivityHiddenSaga({
                                              payload,
                                            }: PayloadEvent<TacticalActivity>) {
  const tacticalActivity: TacticalActivity = {
    ...payload,
    hidden: true,
  };

  yield call(removalReRankSaga, tacticalActivity);

  delete tacticalActivity.rank;
  yield put(createUpdatedTacticalActivityEvent(tacticalActivity));
  yield put(createArchivedTacticalActivityEvent(tacticalActivity));
}

export function* tacticalActivityShownSaga({
                                             payload,
                                           }: PayloadEvent<TacticalActivity>) {
  const tacticalActivity: TacticalActivity = {
    ...payload,
    hidden: false,
  };
  delete tacticalActivity.rank;
  yield put(createUpdatedTacticalActivityEvent(tacticalActivity));
  yield put(createRestoredTacticalActivityEvent(tacticalActivity));
}
