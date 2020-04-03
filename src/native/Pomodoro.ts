import {NativeModules} from 'react-native';

interface PomodoroParameters {
  timeToAlert: number;
}

interface Pomodoro {
  commencePomodoroForActivity: (params: PomodoroParameters) => void;
  stopItGetSomeHelp(): void;
}

export default NativeModules.Pomodoro as Pomodoro;
