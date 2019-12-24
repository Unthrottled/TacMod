import React, {Dispatch, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import uuid from 'uuid/v4';
import {Animated, StyleSheet, View} from 'react-native';
import {
  GlobalState,
  selectActivityState,
  selectTacticalState,
} from '../../reducers';
import {createCompletedPomodoroEvent} from '../../events/ActivityEvents';
import {buildCommenceActivityContents} from './ActivityHub';
import {
  startNonTimedActivity,
  startTimedActivity,
} from '../../actions/ActivityActions';
import {
  Activity,
  ActivityTimedType,
  ActivityType,
  getActivityID,
  isActivityRecovery,
  isPausedActivity,
  RECOVERY,
} from '../../types/ActivityTypes';
import omit from 'lodash/omit';
import {dictionaryReducer} from '../../reducers/StrategyReducer';
import {numberObjectToArray} from '../../miscellanous/Tools';
import {HasId, NumberDictionary, StringDictionary} from '../../types/BaseTypes';
import {FAB, Headline, Portal, Text} from 'react-native-paper';
import {PomodoroTimer} from './PomodoroTimer';
import Stopwatch from './Stopwatch';
import ActivityIcon from '../../images/ActivityIcon';
import Icon from 'react-native-vector-icons/FontAwesome5';

export const timeFontSize = 40;

export const mapTacticalActivitiesToID = <T extends HasId>(
  tacticalActivities: NumberDictionary<T>,
): StringDictionary<T> =>
  numberObjectToArray(tacticalActivities).reduce(dictionaryReducer, {});

const classes = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  pomoCount: {
    display: 'flex',
  },
  timer: {
    bottom: 0,
    width: '100%',
    display: 'flex',
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 69,
  },
  recovery: {},
  close: {
    position: 'relative',
    paddingRight: 16,
  },
  activityIcon: {
    alignItems: 'center',
    lineHeight: 1,
    marginBottom: 16,
  },
});

export const getTime = (antecedenceTime: number) =>
  Math.floor((new Date().getTime() - antecedenceTime || 0) / 1000);
const getTimerTime = (stopTime: number) =>
  Math.floor((stopTime - new Date().getTime()) / 1000);

export const resumeActivity = (
  dispetch: Dispatch<any>,
  previousActivity: Activity,
  currentActivity: Activity,
) => {
  dispetch(
    startTimedActivity({
      ...previousActivity.content,
      ...(previousActivity.content.duration
        ? {
            duration: Math.max(
              previousActivity.content.duration +
                (previousActivity.antecedenceTime -
                  currentActivity.antecedenceTime),
              0,
            ),
          }
        : {}),
      ...(previousActivity.content.workStartedWomboCombo
        ? {
            workStartedWomboCombo: Math.max(
              new Date().valueOf() -
                (currentActivity.antecedenceTime -
                  previousActivity.content.workStartedWomboCombo),
              0,
            ),
          }
        : {}),
      uuid: uuid(),
    }),
  );
};

const mapStateToProps = (state: GlobalState) => {
  const {
    currentActivity,
    previousActivity,
    shouldTime,
    completedPomodoro: {count},
  } = selectActivityState(state);
  const {
    pomodoro: {settings},
    activity: {activities},
  } = selectTacticalState(state);
  return {
    shouldTime,
    currentActivity,
    previousActivity,
    pomodoroSettings: settings,
    activities,
    numberOfCompletedPomodoro: count,
  };
};

const ActivityTimeBar = () => {
  const {
    shouldTime,
    currentActivity,
    previousActivity,
    pomodoroSettings,
    activities,
    numberOfCompletedPomodoro,
  } = useSelector(mapStateToProps);

  const {
    antecedenceTime,
    content: {uuid: activityId, timedType, duration, name},
  } = currentActivity;

  const dispetch: Dispatch<any> = useDispatch();
  const stopActivity = () => {
    dispetch(
      startNonTimedActivity({
        name: RECOVERY,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.NONE,
        uuid: uuid(),
      }),
    );
  };

  const startRecovery = (autoStart: boolean = false) => {
    dispetch(
      startTimedActivity({
        name: RECOVERY,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.TIMER,
        duration:
          (numberOfCompletedPomodoro + 1) % 4 === 0
            ? pomodoroSettings.longRecoveryDuration
            : pomodoroSettings.shortRecoveryDuration,
        uuid: uuid(),
        ...(autoStart
          ? {
              autoStart: true,
            }
          : {}),
      }),
    );
  };

  const pivotActivity = (name: string, supplements: any) => {
    const activityContent = buildCommenceActivityContents(supplements, name);
    return dispetch(
      startTimedActivity({
        ...activityContent,
        paused: true,
      }),
    );
  };

  const startPausedRecovery = () => {
    dispetch(
      startTimedActivity({
        name: RECOVERY,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.STOP_WATCH,
        paused: true,
        uuid: uuid(),
      }),
    );
  };

  const completedPomodoro = () => {
    if (name === RECOVERY) {
      resumePreviousActivity(true);
    } else {
      startRecovery(true);
      dispetch(createCompletedPomodoroEvent());
    }
  };

  function resumePreviousActivity(autoStart: boolean = false) {
    dispetch(
      startTimedActivity({
        ...omit(previousActivity.content, ['autoStart']),
        ...(previousActivity.content.duration
          ? {
              duration: pomodoroSettings.loadDuration,
            }
          : {}),
        ...(autoStart
          ? {
              autoStart: true,
            }
          : {}),
        uuid: uuid(),
      }),
    );
  }

  const startRecoveryOrResume = () => {
    if (name === RECOVERY) {
      resumePreviousActivity();
    } else {
      startRecovery();
    }
  };

  const isTimer = timedType === ActivityTimedType.TIMER;

  const isRecovery = isActivityRecovery(currentActivity);
  const getTimerBarClasses = () => {
    const timerBarClasses: any = [classes.timer];
    if (isRecovery) {
      timerBarClasses.push(classes.recovery);
    }
    return timerBarClasses.join(' ');
  };

  const mappedTacticalActivities = mapTacticalActivitiesToID(activities);
  const tacticalActivity =
    mappedTacticalActivities[getActivityID(currentActivity)];

  const isTimeBarActivity = shouldTime && !isPausedActivity(currentActivity);

  const [backdrop] = useState<Animated.Value>(new Animated.Value(0));
  useEffect(() => {
    if (isTimeBarActivity) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdrop, isTimeBarActivity]);

  const backdropOpacity = isTimeBarActivity
    ? backdrop.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      })
    : backdrop;

  return isTimeBarActivity ? (
    <Portal>
      <View pointerEvents={'box-none'} style={classes.container}>
        <Animated.View
          pointerEvents={isTimeBarActivity ? 'auto' : 'none'}
          style={[
            classes.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: 'rgba(9,19,9,0.9)',
            },
          ]}>
          <View
            style={{
              marginTop: 'auto',
              marginBottom: 'auto',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}>
            {tacticalActivity && (
              <View style={classes.activityIcon}>
                <View style={{alignItems: 'center', marginBottom: 10}}>
                  <Headline
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                      color: 'white',
                      textAlign: 'left',
                      maxWidth: 130,
                    }}>
                    {tacticalActivity.name}
                  </Headline>
                  <Icon name={'chevron-down'} color={'white'} />
                </View>
                <ActivityIcon
                  activity={tacticalActivity}
                  size={{
                    width: '50px',
                    height: '50px',
                  }}
                />
              </View>
            )}
            {isTimer ? (
              <PomodoroTimer
                startTimeInSeconds={getTimerTime(
                  antecedenceTime + (duration || 0),
                )}
                onComplete={completedPomodoro}
                onPause={startPausedRecovery}
                pivotActivity={pivotActivity}
                onBreak={startRecovery}
                hidePause={isRecovery}
                onResume={startRecoveryOrResume}
                activityId={activityId}
                fontSize={40}
              />
            ) : (
              <Stopwatch
                startTimeInSeconds={getTime(
                  currentActivity.content.workStartedWomboCombo ||
                    new Date().valueOf(),
                )}
                fontSize={timeFontSize}
                onPause={startPausedRecovery}
                activityId={activityId}
              />
            )}
          </View>
          <FAB
            color={'black'}
            icon={'close'}
            style={{
              backgroundColor: 'red',
              right: 16,
              position: 'absolute',
              bottom: 16,
            }}
            onPress={stopActivity}
          />
        </Animated.View>
      </View>
    </Portal>
  ) : null;
};

export default ActivityTimeBar;
