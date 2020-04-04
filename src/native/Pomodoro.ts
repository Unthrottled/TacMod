import {NativeModules} from 'react-native';
import {PomodoroSettings} from '../types/TacticalTypes';
import {Activity} from '../types/ActivityTypes';

interface PomodoroParameters {
  pomodoroSettings: PomodoroSettings;
  currentActivity: Activity;
  previousActivity: Activity;
  numberOfCompletedPomodoro: number;
}

interface Pomodoro {
  commencePomodoroForActivity: (params: PomodoroParameters) => void;
  stopItGetSomeHelp(): void;
}

export default NativeModules.Pomodoro as Pomodoro;
