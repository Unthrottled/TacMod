import React, {FC, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {TimeDisplay} from './TimeDisplay';
import {useSelector} from 'react-redux';
import {selectTimeState} from '../../reducers';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {GENERIC_ACTIVITY_NAME, OpenedSelection} from './ActivityHub';
import ActivitySelection from '../ActivitySelection';

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
  startActivity: (name: string, stuff: {activityID?: string}) => void;
}

const Stopwatch: FC<Props> = ({startActivity, onPause, fontSize}) => {
  const pauseTimer = () => {
    onPause && onPause();
  };
  const getPauseButton = () => (
    <TouchableOpacity onPress={pauseTimer}>
      <MaterialIcon color={'white'} name={'pause'} size={50}/>
    </TouchableOpacity>
  );

  const [selectionOpen, setSelectionOpen] = useState(false);

  const closeSelection = () => setSelectionOpen(false);
  const openSelection = () => setSelectionOpen(true);

  const getSwappoButton = () => (
    <TouchableOpacity onPress={openSelection}>
      <MaterialIcon color={'white'} name={'swap-horiz'} size={50}/>
    </TouchableOpacity>
  );

  const timeElapsed = useSelector(selectTimeState).timeElapsed;

  return (
    <View style={classes.stopwatchContainer}>
      <View>
        <TimeDisplay timeElapsed={timeElapsed} fontSize={fontSize}/>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <View style={classes.actionButton}>{onPause && getPauseButton()}</View>
        <View style={classes.actionButton}>{onPause && getSwappoButton()}</View>
      </View>
      <ActivitySelection
        open={selectionOpen}
        onClose={closeSelection}
        onActivitySelection={activity => {
          closeSelection();
          startActivity &&
          startActivity(activity.name, {activityID: activity.id});
        }}
        onGenericActivitySelection={() =>
          startActivity && startActivity(GENERIC_ACTIVITY_NAME, {})
        }
        genericIcon={OpenedSelection.STOPWATCH}
      />
    </View>
  );
};

export default Stopwatch;
