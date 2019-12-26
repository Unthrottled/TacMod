import {combineReducers} from 'redux';
import userReducer, {UserState} from './UserReducer';
import securityReducer, {SecurityState} from './SecurityReducer';
import configurationReducer, {ConfigurationState} from './ConfigurationReducer';
import activityReducer, {ActivityState} from './ActivityReducer';
import networkReducer, {NetworkState} from './NetworkReducer';
import HistoryReducer, {HistoryState} from './HistoryReducer';
import StrategyReducer, {StrategyState} from './StrategyReducer';
import TacticalReducer, {
  PomodoroState,
  TacticalActivityState,
} from './TacticalReducer';
import MiscellaneousReducer, {MiscellaneousState} from './MiscellaneousReducer';
import {TacticalState} from '../types/TacticalTypes';
import {Reducer} from 'react';
import timeReducer, {TimeState} from './TimeReducer';

export interface GlobalState {
  security: SecurityState;
  user: UserState;
  configuration: ConfigurationState;
  time: TimeState;
  activity: ActivityState;
  network: NetworkState;
  history: HistoryState;
  strategy: StrategyState;
  tactical: TacticalState;
  misc: MiscellaneousState;
}

const rootReducer = (): Reducer<any, any> =>
  combineReducers({
    security: securityReducer,
    user: userReducer,
    configuration: configurationReducer,
    activity: activityReducer,
    network: networkReducer,
    time: timeReducer,
    history: HistoryReducer,
    strategy: StrategyReducer,
    tactical: TacticalReducer,
    misc: MiscellaneousReducer,
  });

export const selectSecurityState = (globalState: GlobalState): SecurityState =>
  globalState.security;

export const selectTimeState = (globalState: GlobalState): TimeState =>
  globalState.time;

export const selectMiscState = (globalState: GlobalState): MiscellaneousState =>
  globalState.misc;

export const selectActivityState = (globalState: GlobalState): ActivityState =>
  globalState.activity;

export const selectNetworkState = (globalState: GlobalState): NetworkState =>
  globalState.network;

export const selectUserState = (globalState: GlobalState): UserState =>
  globalState.user;

export const selectConfigurationState = (
  globalState: GlobalState,
): ConfigurationState => globalState.configuration;

export const selectHistoryState = (globalState: GlobalState): HistoryState =>
  globalState.history;

export const selectStrategyState = (globalState: GlobalState): StrategyState =>
  globalState.strategy;

export const selectTacticalState = (globalState: GlobalState): TacticalState =>
  globalState.tactical;

export const selectPomodoroState = (globalState: GlobalState): PomodoroState =>
  selectTacticalState(globalState).pomodoro;

export const selectTacticalActivityState = (
  globalState: GlobalState,
): TacticalActivityState => selectTacticalState(globalState).activity;

export default rootReducer;
