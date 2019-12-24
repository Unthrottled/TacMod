import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import {IconButton} from 'react-native-paper';

const classes = StyleSheet.create({
  stopwatchContainer: {},
  actionButton: {
    alignItems: 'center'
  },
});

interface Props {
  startTimeInSeconds: number;
  activityId: string;
  onPause?: () => void;
  onResume?: () => void;
  fontSize?: number;
}
const Stopwatch: FC<Props> = ({
  startTimeInSeconds,
  activityId,
  onPause,
  fontSize,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimer = () => {
    onPause && onPause();
    setIsPaused(true);
  };
  const [timeElapsed, setTimeElapsed] = useState(startTimeInSeconds || 0);

  useEffect(() => {
    let timeout: any;
    if (!isPaused) {
      timeout = setTimeout(() => {
        setTimeElapsed(timeElapsed + 1);
      }, 1000);
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  });
  const [rememberedActivity, setRememberedActivity] = useState(
    activityId || '',
  );

  const activityTheSame = rememberedActivity === activityId;
  if (!activityTheSame) {
    setTimeElapsed(startTimeInSeconds);
    setRememberedActivity(activityId);
  }
  const getPauseButton = () => (
    <IconButton icon={'pause'} size={40} color={'white'} onPress={pauseTimer} />
  );

  return (
    <View style={classes.stopwatchContainer}>
      <View>
        <TimeDisplay timeElapsed={timeElapsed} fontSize={fontSize} />
      </View>
      <View style={classes.actionButton}>{onPause && getPauseButton()}</View>
    </View>
  );
};

export default Stopwatch;
