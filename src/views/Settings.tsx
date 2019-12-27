import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {
  createUpdatedPomodoroSettingsEvent,
  createViewedSettingsEvent,
} from '../events/TacticalEvents';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectMiscState,
  selectPomodoroState,
  selectTacticalState,
} from '../reducers';
import {useNavigation} from 'react-navigation-hooks';
import Slider from "@react-native-community/slider";

const restMarks = [
  {
    value: 0.5,
    label: '0.5',
  },
  {
    value: 3,
    label: '3',
  },
  {
    value: 5,
    label: '5',
  },
  {
    value: 10,
    label: '10',
  },
  {
    value: 20,
    label: '20',
  },
  {
    value: 30,
    label: '30',
  },
];

const recoveryMarks = [
  {
    value: 5,
    label: '5',
  },
  {
    value: 10,
    label: '10',
  },
  {
    value: 20,
    label: '20',
  },
  {
    value: 30,
    label: '30',
  },
  {
    value: 60,
    label: '60',
  },
];

export const MINUTE_CONVERSION = 60000;

const workMarks = [
  {
    value: 5,
    label: '5',
  },
  {
    value: 15,
    label: '15',
  },
  {
    value: 30,
    label: '30',
  },
  {
    value: 60,
    label: '60',
  },
  {
    value: 90,
    label: '90',
  },
];

const Settings = () => {
  const dispatch = useDispatch();
  const {settings: pomodoroSettings} = useSelector(selectPomodoroState);
  useEffect(() => {
    dispatch(createViewedSettingsEvent());
  }, [dispatch]);
  const [recoveryTime, setRecoveryTime] = useState(
    pomodoroSettings.shortRecoveryDuration / MINUTE_CONVERSION,
  );

  const saveRecoveryTime: (
    value: number,
  ) => void = ( time) => {
    // @ts-ignore real
    setRecoveryTime(time);
  };

  const [longRecoveryTime, setLongRecoveryTime] = useState(
    pomodoroSettings.longRecoveryDuration / MINUTE_CONVERSION,
  );

  const saveLongRecoveryTime: (
    value: number,
  ) => void = ( time) => {
    // @ts-ignore real
    setLongRecoveryTime(time);
  };
  const [workTime, setWorkTime] = useState(
    pomodoroSettings.loadDuration / MINUTE_CONVERSION,
  );

  const saveWorkTime: (
    value: number,
  ) => void = ( time) => {
    // @ts-ignore real
    setWorkTime(time);
  };
  const cycleTimeMinutes = (workTime + recoveryTime) * 4 - recoveryTime;

  const {navigate} = useNavigation();
  const saveSettings = () => {
    dispatch(
      createUpdatedPomodoroSettingsEvent({
        loadDuration: workTime * 60000,
        shortRecoveryDuration: recoveryTime * 60000,
        longRecoveryDuration: longRecoveryTime * 60000,
      }),
    );
    navigate('/');
  };

  const discardChanges = () => {
    navigate('/');
  };
  return (
    <LoggedInLayout>
      <View>
        <View>
          {/*<TomatoIcon size={{width: 50, height: 50}} />*/}
          <Text>
            Work Duration (minutes)
          </Text>
          <Slider
            value={workTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveWorkTime}
            minimumValue={5}
            maximumValue={workMarks[workMarks.length - 1].value}
          />
          <Text>
            Short Break Duration (minutes)
          </Text>
          <Slider
            value={recoveryTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveRecoveryTime}
            minimumValue={0.5}
            maximumValue={restMarks[restMarks.length - 1].value}
          />
          <Text>
            Long Break Duration (minutes)
          </Text>
          <Slider
            value={longRecoveryTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveLongRecoveryTime}
            minimumValue={5}
            maximumValue={recoveryMarks[recoveryMarks.length - 1].value}
          />
          <View>
            <Text>
              Full Cycle Time (4 iterations): {cycleTimeMinutes} minutes or{' '}
              {(cycleTimeMinutes / 60).toFixed(2)} hours
            </Text>
          </View>
        </View>
      </View>
    </LoggedInLayout>
  );
};

export default Settings;
