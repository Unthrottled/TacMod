import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import ActivitySelection from '../ActivitySelection';
import {GENERIC_ACTIVITY_NAME, OpenedSelection} from './ActivityHub';
import {timeFontSize} from './ActivityTimeBar';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from "react-redux";
import {selectTimeState} from "../../reducers";

const classes = StyleSheet.create({
  stopwatchContainer: {
    alignItems: 'center',
  },
  actionButton: {},
  swappo: {},
  bigIcon: {},
});

interface Props {
  onPause?: () => void;
  onResume?: () => void;
  fontSize?: number;
  pivotActivity?: (name: string, stuff: {activityID?: string}) => void;
  hidePause?: boolean;
}

export const PomodoroTimer: FC<Props> = ({
  onPause,
  fontSize,
  pivotActivity,
  onResume,
  hidePause,
}) => {
  const pauseTimer = () => {
    onPause && onPause();
  };

  const timeElapsed = useSelector(selectTimeState).timeElapsed;

  const [selectionOpen, setSelectionOpen] = useState(false);

  const closeSelection = () => setSelectionOpen(false);
  const openSelection = () => setSelectionOpen(true);
  return (
    <View style={classes.stopwatchContainer}>
      <View style={{margin: 'auto'}}>
        <TimeDisplay fontSize={timeFontSize} timeElapsed={timeElapsed} />
      </View>
      <View style={classes.actionButton}>
        {!hidePause && (
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <TouchableOpacity style={{flexGrow: 1}} onPress={openSelection}>
              <MaterialIcon color={'white'} name={'swap-vert'} size={50} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pauseTimer}>
              <MaterialIcon color={'white'} name={'pause'} size={50} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ActivitySelection
        open={selectionOpen}
        onClose={closeSelection}
        onActivitySelection={activity => {
          closeSelection();
          pivotActivity &&
            pivotActivity(activity.name, {activityID: activity.id});
        }}
        onGenericActivitySelection={() =>
          pivotActivity && pivotActivity(GENERIC_ACTIVITY_NAME, {})
        }
        genericIcon={OpenedSelection.STOPWATCH}
      />
    </View>
  );
};
