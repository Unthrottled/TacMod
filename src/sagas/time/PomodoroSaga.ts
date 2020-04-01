import {call, delay, put, race, select} from 'redux-saga/effects';
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
  getActivityName,
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
import {performGet} from '../APISagas';
import {
  CURRENT_ACTIVITY_URL,
  handleNewActivity,
} from '../activity/CurrentActivitySaga';
import {ActivityState} from '../../reducers/ActivityReducer';
import Alarm from '../../native/Alarm';
import BackgroundTimer from 'react-native-background-timer';
import {PomodoroSettings} from '../../types/TacticalTypes';

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
  const pomodoroDuration =
    getTimerTime(antecedenceTime + (duration || 0)) + addThis;
  yield put(createTimeSetEvent(pomodoroDuration));

  const alarmParameters = yield call(
    getAlarmParameters,
    activityThatStartedThis,
  );

  const fireDate = new Date(new Date().valueOf() + pomodoroDuration * 1000);
  Alarm.setAlarm({
    timeToAlert: fireDate.valueOf(),
    message: alarmParameters.notificationMessage,
    vibrationPattern: alarmParameters.alarmType,
  });
}

function* getAlarmParameters(activityThatStartedThis: Activity) {
  const {
    previousActivity,
    completedPomodoro: {count},
  }: ActivityState = yield select(selectActivityState);

  if (isActivityRecovery(activityThatStartedThis)) {
    return {
      notificationMessage: {
        title: 'Break is over!',
        message: `Get back to ${getActivityName(previousActivity)}`,
      },
      alarmType: 'resume',
    };
  } else {
    return {
      notificationMessage: {
        title: `${getActivityName(activityThatStartedThis)} pomodoro complete.`,
        message: 'Take a break!',
      },
      alarmType: count % 4 === 0 ? 'longBreak' : 'shortBreak',
    };
  }
}

export function stopAllAlarms() {
  Alarm.stopAllAlarms();
}

// todo: does it matter if the app is in the foreground?
export function* newPomodoroSaga() {
  const {
    currentActivity,
    previousActivity,
    pomodoroSettings,
    numberOfCompletedPomodoro,
  } = yield selectAllTheThings();
  yield call(
    () =>
      new Promise(res => {
        BackgroundTimer.setTimeout(() => res(), 0);
      }),
  );
  yield swappoActivities(
    currentActivity,
    previousActivity,
    pomodoroSettings,
    numberOfCompletedPomodoro,
  );
}

function* selectAllTheThings() {
  return yield select((globalState: GlobalState) => {
    const {
      currentActivity: ca,
      previousActivity: pa,
      completedPomodoro: {count},
    } = selectActivityState(globalState);
    const {
      pomodoro: {settings},
    } = selectTacticalState(globalState);
    return {
      currentActivity: ca,
      previousActivity: pa,
      timeElapsed: selectTimeState(globalState).timeElapsed,
      pomodoroSettings: settings,
      numberOfCompletedPomodoro: count,
    };
  });
}

function* swappoActivities(
  activityThatStartedThis: Activity,
  previousActivity: Activity,
  pomodoroSettings: PomodoroSettings,
  numberOfCompletedPomodoro: number,
) {
  const currentActivitySame = yield call(checkCurrentActivity);
  if (currentActivitySame) {
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
  } else {
    yield call(stopAllAlarms);
  }
  return false;
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
    } = yield selectAllTheThings();

    // check to see if current activity is same because could have changed while moving to this next iteration
    const areActivitiesSame = activitiesEqual(
      currentActivity,
      activityThatStartedThis,
    );
    if (areActivitiesSame) {
      if (timeElapsed > 0) {
        yield put(createTimeDecrementEvent());
        const after = new Date().valueOf();
        const waitFor = 1000 - (after - before);
        const {currentActivity: newCurrentActivity} = yield race({
          currentActivity: call(waitForCurrentActivity),
          timeElapsed: delay(waitFor < 0 ? 0 : waitFor),
        });
        shouldKeepTiming = !newCurrentActivity;
      } else {
        shouldKeepTiming = yield swappoActivities(
          activityThatStartedThis,
          previousActivity,
          pomodoroSettings,
          numberOfCompletedPomodoro,
        );
      }
    } else {
      shouldKeepTiming = false;
    }
  } while (shouldKeepTiming);
}

export function* checkCurrentActivity() {
  try {
    const {data: activity} = yield call(performGet, CURRENT_ACTIVITY_URL);
    const {currentActivity} = yield select(selectActivityState);
    const areSame = activitiesEqual(activity, currentActivity);
    if (!areSame) {
      // There is more than one device using SOGoS now
      yield call(handleNewActivity, activity);
    }
    return areSame;
  } catch (e) {
    // todo: what do I do?
    return true;
  }
}
