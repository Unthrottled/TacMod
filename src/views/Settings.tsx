import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {
  createUpdatedPomodoroSettingsEvent,
  createViewedSettingsEvent,
} from '../events/TacticalEvents';
import {useDispatch, useSelector} from 'react-redux';
import {selectPomodoroState} from '../reducers';
import {useNavigation} from 'react-navigation-hooks';
import Slider from '@react-native-community/slider';
import {Avatar, Headline, IconButton, Paragraph} from 'react-native-paper';
import {theme} from '../Theme';
import {bannerStyles} from '../components/Banner';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  banner: {
    marginTop: 10,
    backgroundColor: '#F5FCFF',
    borderRadius: 10,
    margin: 15,
  },
  card: {
    margin: 15,
    borderRadius: 10,
  },
  cardContent: {
    marginRight: 15,
    padding: 10,
    marginLeft: 15,
  },
  cardBullshit: {
    textAlign: 'center',
  },
});

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

  const saveRecoveryTime: (value: number) => void = time => {
    // @ts-ignore real
    setRecoveryTime(time);
  };

  const [longRecoveryTime, setLongRecoveryTime] = useState(
    pomodoroSettings.longRecoveryDuration / MINUTE_CONVERSION,
  );

  const saveLongRecoveryTime: (value: number) => void = time => {
    // @ts-ignore real
    setLongRecoveryTime(time);
  };
  const [workTime, setWorkTime] = useState(
    pomodoroSettings.loadDuration / MINUTE_CONVERSION,
  );

  const saveWorkTime: (value: number) => void = time => {
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
    navigate({routeName: 'LoggedIn'});
  };

  const discardChanges = () => {
    navigate({routeName: 'LoggedIn'});
  };
  return (
    <LoggedInLayout>
      <View
        style={{
          ...styles.banner,
        }}>
        <View
          style={{
            ...bannerStyles.container,
          }}>
          <Headline>Settings</Headline>
          <Paragraph style={bannerStyles.secondary}>
            We all cannot be the same. Therefore we thought it would be handy to
            allow you to adjust the experience to your preferences!
          </Paragraph>
          <MaterialIcon name={'settings'} size={60} />
        </View>
      </View>
      <View>
        <View style={styles.cardContent}>
          <View style={{alignItems: 'center'}}>
            <Avatar.Image
              size={50}
              style={{
                marginTop: 4,
                backgroundColor: 'rgba(0,0,0,0)',
              }}
              source={require('../images/Tomato_big.png')}
            />
            <Text style={{fontSize: 18, fontWeight: '500', marginBottom: 10}}>
              Pomodoro Settings
            </Text>
          </View>
          <Text>Work Duration ( {workTime} minutes)</Text>
          <Slider
            value={workTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveWorkTime}
            onValueChange={saveWorkTime}
            thumbTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
            minimumValue={5}
            maximumValue={workMarks[workMarks.length - 1].value}
          />
          <Text>Short Break Duration ({recoveryTime} minutes)</Text>
          <Slider
            value={recoveryTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveRecoveryTime}
            onValueChange={saveRecoveryTime}
            thumbTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
            minimumValue={0.5}
            maximumValue={restMarks[restMarks.length - 1].value}
          />
          <Text>Long Break Duration ({longRecoveryTime} minutes)</Text>
          <Slider
            value={longRecoveryTime}
            aria-labelledby="discrete-slider-always"
            step={0.5}
            onSlidingComplete={saveLongRecoveryTime}
            onValueChange={saveLongRecoveryTime}
            thumbTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.primary}
            minimumTrackTintColor={theme.colors.primary}
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
      <View
        style={{
          flexDirection: 'row',
          marginRight: 'auto',
          marginLeft: 'auto',
          marginTop: 20,
        }}>
        <IconButton
          icon={'content-save'}
          size={50}
          color={theme.colors.primary}
          onPress={saveSettings}
        />
        <IconButton
          icon={'close-circle'}
          size={50}
          color={theme.colors.primary}
          onPress={discardChanges}
        />
      </View>
    </LoggedInLayout>
  );
};

export default Settings;
