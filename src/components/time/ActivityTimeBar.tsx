import React, {Dispatch, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import uuid from 'uuid/v4';
import {Animated, StyleSheet, View} from 'react-native';
import {
  GlobalState,
  selectActivityState,
  selectTacticalState,
} from '../../reducers';
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
import {FAB, Headline, IconButton, Menu, Portal} from 'react-native-paper';
import {PomodoroTimer} from './PomodoroTimer';
import Stopwatch from './Stopwatch';
import ActivityIcon from '../../images/ActivityIcon';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from 'react-navigation-hooks';
import {requestLogoff} from '../../events/SecurityEvents';
import {act} from 'react-test-renderer';
import {createCanceledPomodoroEvent} from '../../events/ActivityEvents';

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
  const {currentActivity, previousActivity, shouldTime} = selectActivityState(
    state,
  );
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
  };
};

const ActivityTimeBar = () => {
  const {
    shouldTime,
    currentActivity,
    previousActivity,
    pomodoroSettings,
    activities,
  } = useSelector(mapStateToProps);

  const {
    content: {timedType, name},
  } = currentActivity;

  const dispetch: Dispatch<any> = useDispatch();
  const isTimer = timedType === ActivityTimedType.TIMER;
  const stopActivity = () => {
    if (isTimer) {
      dispetch(createCanceledPomodoroEvent());
    }
    dispetch(
      startNonTimedActivity({
        name: RECOVERY,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.NONE,
        uuid: uuid(),
      }),
    );
  };

  const pivotActivity = (name: string, supplements: any) => {
    const activityContent = buildCommenceActivityContents(supplements, name);
    dispetch(createCanceledPomodoroEvent());
    return dispetch(
      startTimedActivity({
        ...activityContent,
        paused: true,
      }),
    );
  };

  const swapToActivity = (name: string, supplements: any) => {
    return dispetch(
      startTimedActivity(buildCommenceActivityContents(supplements, name)),
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

  const swapActivity = (activityName: string, supplements: any) => {
    const meow = new Date().valueOf();
    const duration =
      currentActivity.content.duration || pomodoroSettings.loadDuration;
    dispetch(createCanceledPomodoroEvent());
    dispetch(
      startTimedActivity({
        ...supplements,
        name: activityName,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.TIMER,
        duration: duration - (meow - currentActivity.antecedenceTime),
        uuid: uuid(),
      }),
    );
  };

  const resumePreviousActivity = () => {
    dispetch(
      startTimedActivity({
        ...omit(previousActivity.content, ['autoStart']),
        ...(previousActivity.content.duration
          ? {
              duration: pomodoroSettings.loadDuration,
            }
          : {}),
        uuid: uuid(),
      }),
    );
  };

  const isRecovery = isActivityRecovery(currentActivity);
  const backgroundStyle = isRecovery
    ? {
        backgroundColor: 'rgb(33,150,243)',
      }
    : {
        backgroundColor: '#30ad5a',
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

  const [menuVisible, setMenuVisible] = useState(false);
  const hideMenu = () => {
    setMenuVisible(false);
  };

  const openMenu = () => {
    setMenuVisible(true);
  };

  const {navigate} = useNavigation();
  const logUserOut = (): void => {
    hideMenu();
    dispetch(requestLogoff());
    navigate({routeName: 'Login'});
  };

  return isTimeBarActivity ? (
    <Portal>
      <View pointerEvents={'box-none'} style={classes.container}>
        <Animated.View
          pointerEvents={isTimeBarActivity ? 'auto' : 'none'}
          style={[
            classes.backdrop,
            {
              opacity: backdropOpacity,
              ...backgroundStyle,
            },
          ]}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}>
            <Menu
              visible={menuVisible}
              onDismiss={hideMenu}
              anchor={
                <IconButton
                  icon={'dots-vertical'}
                  size={40}
                  color={'white'}
                  onPress={openMenu}
                />
              }>
              <Menu.Item onPress={logUserOut} title={'Logout'} />
            </Menu>
          </View>
          <View
            style={{
              marginTop: 'auto',
              marginBottom: 'auto',
              marginRight: 'auto',
              marginLeft: 'auto',
              alignItems: 'center',
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
                onPause={startPausedRecovery}
                onResume={resumePreviousActivity}
                pivotActivity={pivotActivity}
                swapActivity={swapActivity}
                hidePause={isRecovery}
                fontSize={40}
              />
            ) : (
              <Stopwatch
                fontSize={timeFontSize}
                onPause={startPausedRecovery}
                startActivity={swapToActivity}
              />
            )}
          </View>
          <FAB
            color={'black'}
            icon={'close'}
            style={{
              backgroundColor: 'red',
              opacity: 0.69,
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
