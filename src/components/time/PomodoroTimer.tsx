import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import ActivitySelection from '../ActivitySelection';
import {GENERIC_ACTIVITY_NAME, OpenedSelection} from './ActivityHub';
import {IconButton} from 'react-native-paper';
import {theme} from "../../Theme";

const classes = StyleSheet.create({
  stopwatchContainer: {},
  actionButton: {
    marginLeft: 24,
    lineHeight: 1,
    marginTop: 'auto',
  },
  swappo: {
    marginRight: 24,
    lineHeight: 1,
    marginTop: 'auto',
  },
  bigIcon: {
  },
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
      {!hidePause && (
        <IconButton
          icon={'swap-vert'}
          color={'inherit'}
          style={classes.swappo}
          onPress={openSelection}
        />
      )}
      <View style={{margin: 'auto'}}>
        <TimeDisplay timeElapsed={timeElapsed} />
      </View>
      <View style={classes.actionButton}>
        {!hidePause && (
          <IconButton icon={'pause'} color={'inherit'} onPress={pauseTimer} />
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
