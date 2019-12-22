import React, {useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import {theme} from '../App';
import uuid from 'uuid/v4';
import {ActivityTimedType, ActivityType} from '../types/ActivityTypes';
import {
  GlobalState,
  selectConfigurationState,
  selectTacticalActivityState,
  selectTacticalState,
} from '../reducers';
import {TacticalActivity} from '../types/TacticalTypes';
import {useDispatch, useSelector} from 'react-redux';
import {startTimedActivity} from '../actions/ActivityActions';
import ActivitySelection from './ActivitySelection';

export const GENERIC_ACTIVITY_NAME = 'GENERIC_ACTIVITY';

const mapStateToProps = (state: GlobalState) => {
  const {
    pomodoro: {
      settings: {loadDuration},
    },
  } = selectTacticalState(state);
  const {
    miscellaneous: {notificationsAllowed},
  } = selectConfigurationState(state);
  const {activities} = selectTacticalActivityState(state);
  return {
    loadDuration,
    notificationsAllowed,
    activities,
  };
};

export const buildCommenceActivityContents = (
  supplements: any,
  name: string,
) => ({
  ...supplements,
  name,
  type: ActivityType.ACTIVE,
  timedType: ActivityTimedType.STOP_WATCH,
  uuid: uuid(),
  workStartedWomboCombo: new Date().getTime(),
});

const ActivityHub = () => {
  const [open, setOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  const {loadDuration} = useSelector(mapStateToProps);

  const dispetch = useDispatch();
  const commenceActivity = (name: string, supplements: any) =>
    dispetch(
      startTimedActivity(buildCommenceActivityContents(supplements, name)),
    );

  const commenceTimedActivity = (name: string, supplements: any) => {
    return dispetch(
      startTimedActivity({
        ...supplements,
        name,
        type: ActivityType.ACTIVE,
        timedType: ActivityTimedType.TIMER,
        duration: loadDuration,
        uuid: uuid(),
      }),
    );
  };

  const commenceTimedObjectiveActivity = (activity: TacticalActivity) => {
    commenceTimedActivity(activity.name, {activityID: activity.id});
  };

  const commenceGenericTimedActivity = () => {
    commenceTimedActivity('GENERIC_TIMED_ACTIVITY', {});
  };

  const commenceObjectiveActivity = (activity: TacticalActivity) => {
    commenceActivity(activity.name, {activityID: activity.id});
  };

  const commenceGenericActivity = () => {
    commenceActivity(GENERIC_ACTIVITY_NAME, {});
  };

  return (
    <Portal>
      <FAB.Group
        visible={true}
        open={open}
        fabStyle={{
          backgroundColor: theme.colors.primary,
        }}
        color={theme.colors.text}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'timer',
            label: 'Timed Activity',
            onPress: () => console.log('Pressed add'),
          },
          {
            icon: require('../images/Tomato.png'),
            label: 'Pomodoro Timer',
            onPress: () => {
              console.log('Pressed email');
              setActivitiesOpen(true);
            },
          },
        ]}
        onStateChange={({open}) => setOpen(open)}
      />
      <ActivitySelection
        open={activitiesOpen}
        onClose={() => setActivitiesOpen(false)}
        onActivitySelection={activity => {
          console.warn(JSON.stringify(activity));
          setActivitiesOpen(false);
        }}
        onGenericActivitySelection={() => {
          console.warn('chose generic action');
        }}
        genericIcon={<></>}
      />
    </Portal>
  );
};

export default ActivityHub;
