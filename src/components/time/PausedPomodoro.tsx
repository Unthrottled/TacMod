import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  GlobalState,
  selectActivityState,
  selectTacticalActivityState,
} from '../../reducers';
import Stopwatch from './Stopwatch';
import {getTime, resumeActivity} from './ActivityTimeBar';
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
import {IconButton} from 'react-native-paper';
import ActivityIcon from "../../images/ActivityIcon";

const classes = StyleSheet.create({
  container: {
    top: '0',
    width: '100%',
    height: '100%',
  },
  contents: {
    top: '30%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  stopWatch: {
    margin: 'auto',
  },
  icon: {},
  cancel: {},
  cancelIcon: {
    color: 'red',
    background: 'rgba(240, 0,0,0.25)',
    padding: 4,
  },
  pivotContainer: {
    marginTop: 8,
  },
  pivotLabel: {
    display: 'flex',
    marginBottom: 8,
    justifyContent: 'center',
  },
});

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
    antecedenceTime,
    content: {uuid: activityId, timedType},
  } = currentActivity;

  const mappedTacticalActivities: StringDictionary<
    TacticalActivity
  > = numberObjectToArray(activities).reduce(dictionaryReducer, {});
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
  return isPausedPomodoro ? (
    <View style={classes.container}>
      <View style={classes.contents}>
        <View style={classes.stopWatch} />
        <View>
          <Stopwatch
            startTimeInSeconds={getTime(antecedenceTime)}
            fontSize={40}
            activityId={activityId}
          />
        </View>
        <View style={classes.stopWatch}>
          <IconButton
            icon={'play'}
            color={'inherit'}
            onPress={resumePreviousActivity}
          />
          <IconButton
            icon={'stop'}
            style={classes.cancel}
            color={'inherit'}
            onPress={stopActivity}
          />
        </View>
        {(tacticalActivity ||
          getActivityName(currentActivity) === GENERIC_ACTIVITY_NAME) && (
          <View style={classes.pivotContainer}>
            <View style={classes.pivotLabel}>
              <View>
                Pivoted to: {getActivityName(currentActivity).replace(/_/, ' ')}{' '}
              </View>
            </View>
            {tacticalActivity && (
              <ActivityIcon activity={tacticalActivity} />
            )}
          </View>
        )}
      </View>
    </View>
  ) : null;
};

export default PausedPomodoro;
