import {NativeModules} from 'react-native';

interface AlarmParameters {
  timeToAlert: number;
  message: string;
}

interface Alarm {
  setAlarm: (alarmParameters: AlarmParameters) => void;

  stopAllAlarms(): void;
}

export default NativeModules.Alarm as Alarm;
