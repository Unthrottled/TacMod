import {call, put, race, select} from 'redux-saga/effects';
import BackgroundTimer from 'react-native-background-timer';
import uuid from 'uuid/v4';
import {
  GlobalState,
  selectActivityState,
  selectTacticalState,
  selectTimeState,
} from '../../reducers';
import {
  activitiesEqual,
  Activity,
  ActivityContent,
  ActivityTimedType,
  ActivityType,
  isActivityRecovery,
  RECOVERY,
} from '../../types/ActivityTypes';
import {
  createTimeDecrementEvent,
  createTimeSetEvent,
} from '../../events/TimeEvents';
import {waitForCurrentActivity} from './SandsOfTimeSaga';
import {
  createCompletedPomodoroEvent,
  createStartedActivityEvent,
  createStartedTimedActivityEvent,
} from '../../events/ActivityEvents';
import omit from 'lodash/omit';

const getTimerTime = (stopTime: number) =>
  Math.floor((stopTime - new Date().getTime()) / 1000);

function* commenceTimedActivity(activityContent: ActivityContent) {
  const action = createStartedActivityEvent(activityContent);
  yield put(action);
  yield call(setTimer, action.payload);
  yield put(createStartedTimedActivityEvent(activityContent));
}

function* setTimer(activityThatStartedThis: Activity, addThis: number = 0) {
  const {
    antecedenceTime,
    content: {duration},
  } = activityThatStartedThis;
  yield put(
    createTimeSetEvent(
      getTimerTime(antecedenceTime + (duration || 0)) + addThis,
    ),
  );
}

export function* pomodoroSaga(activityThatStartedThis: Activity) {
  yield call(setTimer, activityThatStartedThis, 1);

  let shouldKeepTiming: boolean = false;
  do {
    const before = new Date().valueOf();

    const {
      currentActivity,
      previousActivity,
      timeElapsed,
      pomodoroSettings,
      numberOfCompletedPomodoro,
    } = yield select((globalState: GlobalState) => {
      const {
        currentActivity,
        previousActivity,
        completedPomodoro: {count},
      } = selectActivityState(globalState);
      const {
        pomodoro: {settings},
      } = selectTacticalState(globalState);
      return {
        currentActivity,
        previousActivity,
        timeElapsed: selectTimeState(globalState).timeElapsed,
        pomodoroSettings: settings,
        numberOfCompletedPomodoro: count,
      };
    });

    // check to see if current activity is same because could have changed while moving to this next iteration
    const areActivitiesSame = activitiesEqual(
      currentActivity,
      activityThatStartedThis,
    );
    if (areActivitiesSame) {
      if (timeElapsed > 0) {
        yield put(createTimeDecrementEvent());
        const waiter = new Promise(resolve => {
          const after = new Date().valueOf();
          const waitFor = 1000 - (after - before);
          return BackgroundTimer.setTimeout(resolve, waitFor);
        });
        const {newCurrentActivity} = yield race({
          currentActivity: call(waitForCurrentActivity),
          timeElapsed: call(() => waiter),
        });
        shouldKeepTiming = !newCurrentActivity;
      } else {
        if (isActivityRecovery(activityThatStartedThis)) {
          // @ts-ignore real
          const activityContent: ActivityContent = {
            ...omit(previousActivity.content, ['autoStart']),
            duration: pomodoroSettings.loadDuration,
            autoStart: true,
            uuid: uuid(),
          };
          yield call(commenceTimedActivity, activityContent);
        } else {
          const activityContent = {
            name: RECOVERY,
            type: ActivityType.ACTIVE,
            timedType: ActivityTimedType.TIMER,
            duration:
              (numberOfCompletedPomodoro + 1) % 4 === 0
                ? pomodoroSettings.longRecoveryDuration
                : pomodoroSettings.shortRecoveryDuration,
            uuid: uuid(),
            autoStart: true,
          };
          yield call(commenceTimedActivity, activityContent);
          yield put(createCompletedPomodoroEvent());
        }
        shouldKeepTiming = false;
      }
    } else {
      shouldKeepTiming = false;
    }
  } while (shouldKeepTiming);
}
