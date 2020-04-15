import * as React from 'react';
import {useEffect, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {GlobalState, selectActivityState, selectTacticalActivityState,} from '../../reducers';
import Stopwatch from './Stopwatch';
import {resumeActivity, timeFontSize} from './ActivityTimeBar';
import uuid from 'uuid/v4';
import {numberObjectToArray} from '../../miscellanous/Tools';
import {dictionaryReducer} from '../../reducers/StrategyReducer';
import {GENERIC_ACTIVITY_NAME} from './ActivityHub';
import {TacticalActivity} from '../../types/TacticalTypes';
import {
  ActivityTimedType,
  ActivityType,
  getActivityID,
  getActivityName,
  isPausedActivity,
  RECOVERY,
} from '../../types/ActivityTypes';
import {startNonTimedActivity} from '../../actions/ActivityActions';
import {StringDictionary} from '../../types/BaseTypes';
import {FAB, IconButton, Portal, Text} from 'react-native-paper';
import ActivityIcon from '../../images/ActivityIcon';

const classes = StyleSheet.create(
  StyleSheet.create({
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
  }),
);

const mapStateToProps = (state: GlobalState) => {
  const {currentActivity, previousActivity, shouldTime} = selectActivityState(
    state,
  );
  const {activities} = selectTacticalActivityState(state);
  return {
    shouldTime,
    currentActivity,
    previousActivity,
    activities,
  };
};

const PausedPomodoro = () => {
  const {
    shouldTime,
    currentActivity,
    previousActivity,
    activities,
  } = useSelector(mapStateToProps);
  const {
    content: {timedType},
  } = currentActivity;

  const mappedTacticalActivities: StringDictionary<TacticalActivity> = numberObjectToArray(activities).reduce(dictionaryReducer, {});
  const tacticalActivity =
    mappedTacticalActivities[getActivityID(currentActivity)];

  const dispetch = useDispatch();
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

  const resumePreviousActivity = () => {
    resumeActivity(dispetch, previousActivity, currentActivity);
  };

  const isPausedPomodoro =
    shouldTime &&
    isPausedActivity(currentActivity) &&
    timedType === ActivityTimedType.STOP_WATCH;

  const [backdrop] = useState<Animated.Value>(new Animated.Value(0));
  useEffect(() => {
    if (isPausedPomodoro) {
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
  }, [backdrop, isPausedPomodoro]);

  const backdropOpacity = isPausedPomodoro
    ? backdrop.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1],
    })
    : backdrop;

  const isPivot =
    tacticalActivity ||
    getActivityName(currentActivity) === GENERIC_ACTIVITY_NAME;

  const colourz = isPivot
    ? {
      play: '#ffffff',
      background: 'rgb(76,175,80)',
    }
    : {
      play: '#39af41',
      background: 'rgba(8,11,19,0.9)',
    };
  return isPausedPomodoro ? (
    <Portal>
      <View pointerEvents={'box-none'} style={classes.container}>
        <Animated.View
          pointerEvents={isPausedPomodoro ? 'auto' : 'none'}
          style={[
            classes.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: colourz.background,
            },
          ]}
        />
        <View
          style={{
            marginRight: 'auto',
            marginLeft: 'auto',
          }}>
          <View style={{alignItems: 'center'}}>
            {isPivot && (
              <View style={{marginBottom: 30, alignItems: 'center'}}>
                <View>
                  <Text style={{fontSize: 30, color: 'white'}}>
                    Pivoted to:{' '}
                    {getActivityName(currentActivity).replace(/_/, ' ')}{' '}
                  </Text>
                </View>
                {tacticalActivity && (
                  <ActivityIcon activity={tacticalActivity}/>
                )}
              </View>
            )}

            <Stopwatch fontSize={timeFontSize}/>
            <IconButton
              icon={'play-circle'}
              size={125}
              color={colourz.play}
              onPress={resumePreviousActivity}
            />
          </View>
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
      </View>
    </Portal>
  ) : null;
};

export default PausedPomodoro;
