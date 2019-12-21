import {call, put, select} from 'redux-saga/effects';
import {performStreamedGet} from '../APISagas';
import {
  createAdjustedHistoryTimeFrame,
  createInitializedHistoryEvent,
  createUpdatedFullFeedEvent,
  createUpdatedHistorySelectionEvent,
} from '../../events/HistoryEvents';
import {createShowWarningNotificationEvent} from '../../events/MiscEvents';
import {selectHistoryState, selectUserState} from '../../reducers';
import {HistoryState} from '../../reducers/HistoryReducer';
import {reverseBinarySearch} from '../../miscellanous/Tools';
import {UserState} from '../../reducers/UserReducer';
import {Activity, getActivityContent} from '../../types/ActivityTypes';
import {PayloadEvent} from '../../events/Event';
import {DateRange} from '../../types/HistoryTypes';
import {UserResponse} from '../../types/UserTypes';

export const createHistoryAPIURL = (guid: string, from: number, to: number) =>
  `/history/${guid}/feed?from=${from}&to=${to}`;

const ONE_MINUTE = 60000;
const meow = new Date(new Date().valueOf() + 2 * ONE_MINUTE);
const SEVEN_DAYS = 604800000;
const meowMinusSeven = new Date(meow.getTime() - SEVEN_DAYS);

export function* archiveFetchSaga(
  guid: string,
  fromDate: number,
  toDate: number,
) {
  try {
    const data: Activity[] = yield call(
      performStreamedGet,
      createHistoryAPIURL(guid, fromDate, toDate),
    );
    return data.sort((a, b) => b.antecedenceTime - a.antecedenceTime);
  } catch (e) {
    yield put(
      createShowWarningNotificationEvent(
        'Unable to get activity history! Try again later, please.',
      ),
    );
    return [];
  }
}

export function* historyInitializationSaga({
  payload: {
    information: {guid},
  },
}: PayloadEvent<UserResponse>) {
  const fromDate = meowMinusSeven.valueOf() - 1;
  const toDate = meow.valueOf() + 1;
  const initialHistoryFeed = yield call(
    archiveFetchSaga,
    guid,
    fromDate,
    toDate,
  );
  yield put(
    createInitializedHistoryEvent({
      selection: {
        activities: initialHistoryFeed,
        between: {
          from: meowMinusSeven.valueOf(),
          to: meow.valueOf(),
        },
      },
      full: {
        activities: initialHistoryFeed,
        between: {
          from: fromDate,
          to: toDate,
        },
      },
    }),
  );
}

export function* historyObservationSaga() {
  //todo: update history  when viewed again?
}

export function* historyAdjustmentSaga({
  payload: {from, to},
}: PayloadEvent<DateRange>) {
  const fullHistoryFeed = yield call(getOrUpdateFullFeed, to, from);
  yield call(updateSelection, fullHistoryFeed, to, from);
}

export function* getOrUpdateFullFeed(to: number, from: number) {
  const historyState: HistoryState = yield select(selectHistoryState);
  const fullHistoryRange = historyState.fullHistoryRange;
  if (from > fullHistoryRange.from && to < fullHistoryRange.to) {
    return historyState.fullFeed;
  } else {
    return yield call(updateFullFeed, to, from);
  }
}

export function* updateFullFeed(to: number, from: number) {
  const historyState: HistoryState = yield select(selectHistoryState);
  const userState: UserState = yield select(selectUserState);
  const fullHistoryRange = historyState.fullHistoryRange;
  if (from < fullHistoryRange.from && to <= fullHistoryRange.to) {
    const olderHistory = yield call(
      archiveFetchSaga,
      userState.information.guid,
      from,
      fullHistoryRange.from,
    );
    const updatedHistory = historyState.fullFeed.concat(olderHistory);
    yield put(
      createUpdatedFullFeedEvent({
        activities: updatedHistory,
        between: {
          from,
          to: fullHistoryRange.to,
        },
      }),
    );
    return updatedHistory;
  } else if (from >= fullHistoryRange.from && to > fullHistoryRange.to) {
    const newerHistory = yield call(
      archiveFetchSaga,
      userState.information.guid,
      fullHistoryRange.to,
      to,
    );
    const updatedHistory = newerHistory.concat(historyState.fullFeed);
    yield put(
      createUpdatedFullFeedEvent({
        activities: updatedHistory,
        between: {
          from: fullHistoryRange.from,
          to,
        },
      }),
    );
    return updatedHistory;
  } else {
    const olderHistory = yield call(
      archiveFetchSaga,
      userState.information.guid,
      from,
      fullHistoryRange.from,
    );
    const newerHistory = yield call(
      archiveFetchSaga,
      userState.information.guid,
      fullHistoryRange.to,
      to,
    );
    const updatedHistory = newerHistory
      .concat(historyState.fullFeed)
      .concat(olderHistory);
    yield put(
      createUpdatedFullFeedEvent({
        activities: updatedHistory,
        between: {
          from,
          to,
        },
      }),
    );
    return updatedHistory;
  }
}

export function* updateSelection(
  fullFeed: Activity[],
  to: number,
  from: number,
) {
  const fromRaw = reverseBinarySearch(
    fullFeed,
    (activity: Activity) => activity.antecedenceTime - from,
  );
  const newFrom = fromRaw < 0 ? Math.abs(fromRaw + 1) : fromRaw;
  const safeFrom = newFrom >= fullFeed.length ? fullFeed.length : newFrom;
  const toRaw = reverseBinarySearch(
    fullFeed,
    (activity: Activity) => activity.antecedenceTime - to,
  );
  const newTo = toRaw < 0 ? Math.abs(toRaw + 1) : toRaw;
  yield put(
    createUpdatedHistorySelectionEvent({
      between: {
        from,
        to,
      },
      activities: fullFeed.slice(newTo, safeFrom),
    }),
  );
}

export function* firstActivityAdjustmentSaga() {
  const {
    capstone: {bottomActivity},
  }: HistoryState = yield select(selectHistoryState);
  if (getActivityContent(bottomActivity).veryFirstActivity) {
    const rightMeow = new Date().valueOf();
    const timeToMoveBack = rightMeow - bottomActivity.antecedenceTime;
    yield put(
      createAdjustedHistoryTimeFrame({
        from: bottomActivity.antecedenceTime - timeToMoveBack,
        to: rightMeow,
      }),
    );
  }
}
