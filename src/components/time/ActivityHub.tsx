import React, {useState} from 'react';
import {FAB, Portal} from 'react-native-paper';
import uuid from 'uuid/v4';
import {ActivityTimedType, ActivityType} from '../../types/ActivityTypes';
import {
  GlobalState,
  selectConfigurationState,
  selectTacticalActivityState,
  selectTacticalState,
} from '../../reducers';
import {TacticalActivity} from '../../types/TacticalTypes';
import {useDispatch, useSelector} from 'react-redux';
import {startTimedActivity} from '../../actions/ActivityActions';
import ActivitySelection from '../ActivitySelection';
import {theme} from "../../Theme";
import {createViewedTacticalActivitesEvent} from "../../events/TacticalEvents";

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

export enum OpenedSelection {
  POMODORO,
  STOPWATCH,
  NEITHER,
}

const ActivityHub = () => {
  const [open, setOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [openedSelection, setOpenedSelection] = useState(
    OpenedSelection.NEITHER,
  );

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

  const closeActivitySelection = () => {
    setActivitiesOpen(false);
    setOpenedSelection(OpenedSelection.NEITHER);
  };

  const selectActivity = (activity: TacticalActivity) => {
    if (openedSelection === OpenedSelection.STOPWATCH) {
      commenceObjectiveActivity(activity);
    } else if (openedSelection === OpenedSelection.POMODORO) {
      commenceTimedObjectiveActivity(activity);
    }
    closeActivitySelection();
  };
  const selectGenericActivity = () => {
    if (openedSelection === OpenedSelection.STOPWATCH) {
      commenceGenericActivity();
    } else if (openedSelection === OpenedSelection.POMODORO) {
      commenceGenericTimedActivity();
    }
    closeActivitySelection();
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
            onPress: () => {
              setOpenedSelection(OpenedSelection.STOPWATCH);
              setActivitiesOpen(true);
            },
          },
          {
            icon: require('../../images/Tomato.png'),
            label: 'Pomodoro Timer',
            onPress: () => {
              setOpenedSelection(OpenedSelection.POMODORO);
              setActivitiesOpen(true);
            },
          },
        ]}
        onStateChange={({open}) => {
          if(open){
            dispetch(createViewedTacticalActivitesEvent());
          }
          setOpen(open);
        }}
      />
      <ActivitySelection
        open={activitiesOpen}
        onClose={closeActivitySelection}
        onActivitySelection={selectActivity}
        onGenericActivitySelection={selectGenericActivity}
        genericIcon={openedSelection}
      />
    </Portal>
  );
};

export default ActivityHub;
