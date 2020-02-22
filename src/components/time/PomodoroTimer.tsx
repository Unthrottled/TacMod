import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import ActivitySelection from '../ActivitySelection';
import {GENERIC_ACTIVITY_NAME, OpenedSelection} from './ActivityHub';
import {timeFontSize} from './ActivityTimeBar';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {
  GlobalState,
  selectActivityState,
  selectTimeState,
} from '../../reducers';
import {Avatar, Text} from 'react-native-paper';

const classes = StyleSheet.create({
  stopwatchContainer: {
    alignItems: 'center',
  },
  actionButton: {},
  swappo: {},
  bigIcon: {},
});

type ChangeActivityCallback = (
  name: string,
  stuff: {activityID?: string},
) => void;

interface Props {
  onPause?: () => void;
  onResume?: () => void;
  fontSize?: number;
  pivotActivity?: ChangeActivityCallback;
  swapActivity?: ChangeActivityCallback;
  hidePause?: boolean;
}

export const PomodoroTimer: FC<Props> = ({
  onPause,
  fontSize,
  pivotActivity,
  swapActivity,
  onResume,
  hidePause,
}) => {
  const pauseTimer = () => {
    onPause && onPause();
  };

  const {timeElapsed, pomoCount} = useSelector((globalState: GlobalState) => {
    const timeState = selectTimeState(globalState);
    const activityState = selectActivityState(globalState);
    return {
      timeElapsed: timeState.timeElapsed,
      pomoCount: activityState.completedPomodoro.count,
    };
  });

  const [selectionOpen, setSelectionOpen] = useState(false);
  const [changeActivityFunction, setChangeActivityFunction] = useState<{
    changeActivity: ChangeActivityCallback | undefined;
  }>({
    changeActivity: pivotActivity || swapActivity,
  });
  const closeSelection = () => setSelectionOpen(false);
  const openPivotSelection = () => {
    setChangeActivityFunction({changeActivity: pivotActivity});
    setSelectionOpen(true);
  };
  const openSwappoSelection = () => {
    setChangeActivityFunction({changeActivity: swapActivity});
    setSelectionOpen(true);
  };

  return (
    <View style={classes.stopwatchContainer}>
      <View style={{margin: 'auto'}}>
        <TimeDisplay fontSize={timeFontSize} timeElapsed={timeElapsed} />
      </View>
      <View style={classes.actionButton}>
        {!hidePause && (
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                flexDirection: 'row',
                minWidth: 250,
                justifyContent: 'space-evenly',
              }}>
              <TouchableOpacity onPress={openPivotSelection}>
                <MaterialIcon color={'white'} name={'swap-vert'} size={50} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pauseTimer}>
                <MaterialIcon color={'white'} name={'pause'} size={50} />
              </TouchableOpacity>
              <TouchableOpacity onPress={openSwappoSelection}>
                <MaterialIcon color={'white'} name={'swap-horiz'} size={50} />
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Avatar.Image
                size={25}
                style={{
                  marginTop: 4,
                  backgroundColor: 'rgba(0,0,0,0)',
                }}
                source={require('../../images/Tomato_big.png')}
              />
              <Text style={{fontSize: 25, color: 'white'}}>: {pomoCount}</Text>
            </View>
          </View>
        )}
      </View>
      <ActivitySelection
        open={selectionOpen}
        onClose={closeSelection}
        onActivitySelection={activity => {
          closeSelection();
          changeActivityFunction.changeActivity &&
            changeActivityFunction.changeActivity(activity.name, {
              activityID: activity.id,
            });
        }}
        onGenericActivitySelection={() =>
          changeActivityFunction.changeActivity &&
          changeActivityFunction.changeActivity(GENERIC_ACTIVITY_NAME, {})
        }
        genericIcon={OpenedSelection.STOPWATCH}
      />
    </View>
  );
};
