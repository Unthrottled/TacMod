import {call, put, select} from '@redux-saga/core/effects';
import {Activity} from '../../types/ActivityTypes';
import {selectHistoryState} from '../../reducers';
import {HistoryState} from '../../reducers/HistoryReducer';
import {createUpdatedFullFeedEvent} from '../../events/HistoryEvents';
import {PayloadEvent} from '../../events/Event';

export function* apiBeforeCapstoneSaga({
                                         payload: activity,
                                       }: PayloadEvent<Activity>) {
  const historyState: HistoryState = yield select(selectHistoryState);
  yield put(
    createUpdatedFullFeedEvent({
      activities: [...historyState.fullFeed, activity],
      between: {
        to: historyState.fullHistoryRange.to,
        from: activity.antecedenceTime,
      },
    }),
  );
}

export function* addActivityAfter(activity: Activity) {
  const historyState: HistoryState = yield select(selectHistoryState);
  yield put(
    createUpdatedFullFeedEvent({
      activities: [activity, ...historyState.fullFeed],
      between: {
        from: historyState.fullHistoryRange.from,
        to: activity.antecedenceTime,
      },
    }),
  );
}

export function* apiAfterCapstoneSaga({
                                        payload: activity,
                                      }: PayloadEvent<Activity>) {
  yield call(addActivityAfter, activity);
}

export function* currentActivityHistorySaga({payload}: PayloadEvent<Activity>) {
  yield call(addActivityAfter, payload);
}
