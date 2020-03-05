import {NativeModules} from 'react-native';

interface AlarmParameters {
  timeToAlert: number;
  message: string;
  vibrationPattern: 'shortBreak' | 'longBreak' | 'resume';
}

interface Alarm {
  setAlarm: (alarmParameters: AlarmParameters) => void;

  stopAllAlarms(): void;
}

export default NativeModules.Alarm as Alarm;
