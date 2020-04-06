import {call, delay, put, race, select, take} from 'redux-saga/effects';
import {
  GlobalState,
  selectActivityState,
  selectConfigurationState,
  selectSecurityState,
  selectTacticalState,
  selectTimeState,
  selectUserState,
} from '../../reducers';
import {activitiesEqual, Activity} from '../../types/ActivityTypes';
import {
  createTimeDecrementEvent,
  createTimeSetEvent,
} from '../../events/TimeEvents';
import {waitForCurrentActivity} from './SandsOfTimeSaga';
import Pomodoro, {SecurityStuff} from '../../native/Pomodoro';
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

  if (activityThatStartedThis.content.nativeManaged) {
    return;
  }

  const {
    apiURL,
    currentActivity,
    previousActivity,
    pomodoroSettings,
    numberOfCompletedPomodoro,
    securityStuff,
  } = yield selectAllTheThings();
  Pomodoro.commencePomodoroForActivity({
    apiURL,
    pomodoroSettings,
    currentActivity,
    previousActivity,
    numberOfCompletedPomodoro,
    securityStuff,
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
    const {accessToken, refreshToken, verificationKey} = selectSecurityState(
      globalState,
    );
    const {
      initial: {tokenEndpoint, appClientID, apiURL},
    } = selectConfigurationState(globalState);
    const {
      information: {guid},
    } = selectUserState(globalState);
    const securityStuff: SecurityStuff = {
      accessToken,
      refreshToken,
      tokenEndpoint,
      clientId: appClientID,
      verificationCode: verificationKey,
      guid,
    };
    return {
      apiURL,
      currentActivity: ca,
      previousActivity: pa,
      timeElapsed: selectTimeState(globalState).timeElapsed,
      pomodoroSettings: settings,
      numberOfCompletedPomodoro: count,
      securityStuff,
    };
  });
}
