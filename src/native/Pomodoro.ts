import {NativeModules} from 'react-native';
import {PomodoroSettings} from '../types/TacticalTypes';
import {Activity} from '../types/ActivityTypes';

export interface SecurityStuff {
  apiURL: string;
  accessToken: string;
  refreshToken: string;
  tokenEndpoint: string;
  clientId: string;
  verificationCode: string;
  guid: string;
}

interface PomodoroParameters {
  pomodoroSettings: PomodoroSettings;
  currentActivity: Activity;
  previousActivity: Activity;
  numberOfCompletedPomodoro: number;
  securityStuff: SecurityStuff;
}

interface Pomodoro {
  commencePomodoroForActivity: (params: PomodoroParameters) => void;
  stopItGetSomeHelp(): void;
}

export default NativeModules.Pomodoro as Pomodoro;
