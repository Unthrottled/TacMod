import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import ActivitySelection from '../ActivitySelection';
import {GENERIC_ACTIVITY_NAME, OpenedSelection} from './ActivityHub';
import {IconButton} from 'react-native-paper';
import {timeFontSize} from './ActivityTimeBar';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from "react-native-vector-icons/Fontisto";

const classes = StyleSheet.create({
  stopwatchContainer: {
    alignItems: 'center'
  },
  actionButton: {
  },
  swappo: {
  },
  bigIcon: {},
});

interface Props {
  startTimeInSeconds: number;
  activityId: string;
  onPause?: () => void;
  onComplete?: () => void;
  onResume?: () => void;
  onBreak?: () => void;
  fontSize?: number;
  pivotActivity?: (name: string, stuff: {activityID?: string}) => void;
  hidePause?: boolean;
}

export const PomodoroTimer: FC<Props> = ({
  startTimeInSeconds,
  activityId,
  onComplete,
  onPause,
  pivotActivity,
  onBreak,
  onResume,
  hidePause,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimer = () => {
    onPause && onPause();
    setIsPaused(true);
  };

  const [rememberedActivity, setRememberedActivity] = useState(
    activityId || '',
  );
  const activityTheSame = rememberedActivity === activityId;
  const [timeElapsed, setTimeElapsed] = useState(startTimeInSeconds || 0);
  useEffect(() => {
    let timeout: any;
    if (timeElapsed < 1 && activityTheSame) {
      onComplete && onComplete();
    } else if (!isPaused) {
      timeout = setTimeout(() => {
        setTimeElapsed(timeElapsed - 1);
      }, 1000);
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  });

  if (!activityTheSame) {
    setTimeElapsed(startTimeInSeconds);
    setRememberedActivity(activityId);
  }

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
