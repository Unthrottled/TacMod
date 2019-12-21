import {call, put, select, take} from 'redux-saga/effects';
import {DateRange, HistoryState} from '../../reducers/HistoryReducer';
import {selectHistoryState, selectUserState} from '../../reducers';
import {
  createFoundAfterCapstoneEvent,
  createFoundBeforeCapstoneEvent,
  createUpdatedCapstonesEvent,
  UPDATED_FULL_FEED,
} from '../../events/HistoryEvents';
import {Activity} from '../../types/ActivityTypes';
import {reverseBinarySearch} from '../../miscellanous/Tools';
import {UserState} from '../../reducers/UserReducer';
import {performPost} from '../APISagas';
import {isTimedActivity} from '../activity/CurrentActivitySaga';
import {shouldTime} from '../../miscellanous/Projection';

export type FullRangeAndFeed = {
  activities: Activity[];
  timeRange: DateRange;
};

export function* capstoneHistorySaga(
  selectedDateRange: DateRange,
  fullRangeAndFeed: FullRangeAndFeed,
) {
  const firstBefore: Activity = yield call(
    getFirstBefore,
    selectedDateRange.from,
    fullRangeAndFeed,
  );
  const historyState: HistoryState = yield select(selectHistoryState);
  const maybeAfter: Activity = yield call(getFirstAfter, selectedDateRange.to, {
    activities: historyState.fullFeed,
    timeRange: historyState.fullHistoryRange,
  });
  const firstAfter: Activity = maybeAfter || firstBefore;
  yield put(
    createUpdatedCapstonesEvent({
      beforeCapstone: firstBefore,
      afterCapstone: firstAfter,
    }),
  );
}

const getBeforeIndex = (index: number) => {
  if (index > -1) {
    return index + 1;
  } else {
    return Math.abs(index + 1);
  }
};

const getAfterIndex = (index: number) => {
  if (index > -1) {
    return index - 1;
  } else {
    return Math.abs(index) - 2;
  }
};

export function* getFirstBefore(
  selectedFromDate: number,
  {activities, timeRange: {from}}: FullRangeAndFeed,
) {
  const activityIndex = reverseBinarySearch(
    activities,
    (activity: Activity) => activity.antecedenceTime - selectedFromDate,
  );
  const updatedActivityIndex = getBeforeIndex(activityIndex);

  if (updatedActivityIndex < activities.length - 1) {
    // We might have the oldest timed event in cache.
    const oldestActivity = findOldestTimedActivityInCache(
      updatedActivityIndex,
      activities,
    );
    if (oldestActivity) {
      return oldestActivity;
    }
  }

  // check the API see if it remembers anything
  const {data} = yield call(findFirstActivityBeforeTime, from);
  if (data) {
    yield put(createFoundBeforeCapstoneEvent(data));
    return yield findOldestTimedActivity(data);
  }

  // we have the oldest item in cache
  return activities[activities.length - 1];
}

export const findOldestTimedActivityInCache = (
  activityIndex: number,
  activities: Activity[],
): Activity | undefined => {
  if (activityIndex >= activities.length) {
    return undefined;
  } else {
    const oldActivity = activities[activityIndex];
    if (shouldTime(oldActivity)) {
      return oldActivity;
    } else {
      return findOldestTimedActivityInCache(activityIndex + 1, activities);
    }
  }
};

export function* findOldestTimedActivity(activity: Activity) {
  if (shouldTime(activity)) {
    return activity;
  } else {
    let currentOldie = activity;
    while (!shouldTime(currentOldie)) {
      const {data} = yield call(
        findFirstActivityBeforeTime,
        currentOldie.antecedenceTime,
      );
      if (data) {
        yield put(createFoundBeforeCapstoneEvent(data));
        currentOldie = data;
        if (isTimedActivity(data)) {
          break;
        }
      } else {
        break;
      }
    }
    return currentOldie;
  }
}

export function* getFirstAfter(
  selectedToRange: number,
  {activities, timeRange: {to}}: FullRangeAndFeed,
) {
  const activityIndex = reverseBinarySearch(
    activities,
    (activity: Activity) => activity.antecedenceTime - selectedToRange,
  );
  const updatedActivityIndex = getAfterIndex(activityIndex);
  if (updatedActivityIndex < 0) {
    const {data} = yield call(findFirstActivityAfterTime, to);
    if (data) {
      yield put(createFoundAfterCapstoneEvent(data));
      return data;
    }
  }
  const safeAfter = updatedActivityIndex < 0 ? 0 : updatedActivityIndex;
  return activities[safeAfter];
}

export const constructActivityBeforeURL = (guid: string) =>
  `/history/${guid}/first/before`;

export const constructActivityAfterURL = (guid: string) =>
  `/history/${guid}/first/after`;

export function* findFirstActivityBeforeTime(relativeTime: number) {
  return yield call(
    findCapstoneActivity,
    relativeTime,
    constructActivityBeforeURL,
  );
}

export function* findFirstActivityAfterTime(relativeTime: number) {
  return yield call(
    findCapstoneActivity,
    relativeTime,
    constructActivityAfterURL,
  );
}

export function* findCapstoneActivity(
  relativeTime: number,
  urlBuilder: (arg0: string) => string,
) {
  const {
    information: {guid},
  }: UserState = yield select(selectUserState);
  const beforeURL = urlBuilder(guid);
  try {
    return yield call(performPost, beforeURL, {relativeTime});
  } catch (e) {
    return {};
  }
}

export function* getFullHistory(timeRange: DateRange) {
  const historyState: HistoryState = yield select(selectHistoryState);
  const {fullHistoryRange} = historyState;
  if (
    fullHistoryRange.to < timeRange.to ||
    fullHistoryRange.from > timeRange.from
  ) {
    const {payload} = yield take(UPDATED_FULL_FEED);
    return {
      timeRange: payload.between,
      activities: payload.activities,
    };
  } else {
    return {
      activities: historyState.fullFeed,
      timeRange: historyState.fullHistoryRange,
    };
  }
}
