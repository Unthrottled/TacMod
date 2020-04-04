import {call, delay, put, race, select, take} from 'redux-saga/effects';
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
import {performGet} from '../APISagas';
import {
  CURRENT_ACTIVITY_URL,
  handleNewActivity,
} from '../activity/CurrentActivitySaga';
import {PomodoroSettings} from '../../types/TacticalTypes';
import Pomodoro from '../../native/Pomodoro';
import {buffers, eventChannel} from 'redux-saga';
import {NativeEventEmitter, NativeModules} from 'react-native';

export function* pomodoroSaga(activityThatStartedThis: Activity) {
  yield call(startPomodoroForActivity, activityThatStartedThis, 1);

  let shouldKeepTiming: boolean = false;
  do {
    const before = new Date().valueOf();

    const {currentActivity, timeElapsed} = yield selectAllTheThings();

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
        shouldKeepTiming = false;
        yield take(pomodoroChannel);
      }
    } else {
      shouldKeepTiming = false;
    }
  } while (shouldKeepTiming);
}

const pomodoroChannel = createPomodoroChannel();

function createPomodoroChannel() {
  return eventChannel(statusObserver => {
    const eventEmitter = new NativeEventEmitter(NativeModules.Pomodoro);
    const listener = () => {
      statusObserver('next!');
    };
    eventEmitter.addListener('CompletedPomodoro', listener);
    return () => eventEmitter.removeListener('CompletedPomodoro', listener);
  }, buffers.expanding(100));
}

const getTimerTime = (stopTime: number) =>
  Math.floor((stopTime - new Date().getTime()) / 1000);

/**
 * Initializes the pomodoro native module to do stuff.
 * @param activityThatStartedThis
 * @param addThis
 */
function* startPomodoroForActivity(
  activityThatStartedThis: Activity,
  addThis: number = 0,
) {
  // needed for the ui to show something to count down by
  const {
    antecedenceTime,
    content: {duration},
  } = activityThatStartedThis;
  const pomodoroDuration =
    getTimerTime(antecedenceTime + (duration || 0)) + addThis;
  yield put(createTimeSetEvent(pomodoroDuration));

  const {
    currentActivity,
    previousActivity,
    pomodoroSettings,
    numberOfCompletedPomodoro,
  } = yield selectAllTheThings();
  Pomodoro.commencePomodoroForActivity({
    pomodoroSettings,
    currentActivity,
    previousActivity,
    numberOfCompletedPomodoro,
  });
}

export function stopPomodoro() {
  Pomodoro.stopItGetSomeHelp();
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

/////////////////////////////////////////////////////////////
/////////// Things new native module has to do /////////////
///////////////////////////////////////////////////////////
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
    yield call(stopPomodoro);
  }
  return false;
}

function* commenceTimedActivity(activityContent: ActivityContent) {
  const action = createStartedActivityEvent(activityContent);
  yield put(action);
  yield call(startPomodoroForActivity, action.payload);
  yield put(createStartedTimedActivityEvent(activityContent));
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
