import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import {IconButton} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {selectTimeState} from '../../reducers';

const classes = StyleSheet.create({
  stopwatchContainer: {},
  actionButton: {
    alignItems: 'center',
  },
});

interface Props {
  onPause?: () => void;
  onResume?: () => void;
  fontSize?: number;
}
const Stopwatch: FC<Props> = ({onPause, fontSize}) => {
  const pauseTimer = () => {
    onPause && onPause();
  };
  const getPauseButton = () => (
    <IconButton icon={'pause'} size={40} color={'white'} onPress={pauseTimer} />
  );

  const timeElapsed = useSelector(selectTimeState).timeElapsed;

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
