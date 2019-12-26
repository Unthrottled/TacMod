import SecuritySagas from './SecuritySagas';
import ConfigurationSagas from './ConfigurationSagas';
import UserSagas from './UserSagas';
import ActivitySagas from './ActivitySagas';
import NetworkSagas from './NetworkSagas';
import {all} from 'redux-saga/effects';
import HistorySagas from './HistorySagas';
import StrategySagas from './StrategySagas';
import TacticalSagas from './TacticalSagas';
import CacheSagas from './CacheSagas';
import TimeSagas from './TimeSagas';

export default function* rootSaga() {
  yield all([
    SecuritySagas(),
    ConfigurationSagas(),
    UserSagas(),
    TimeSagas(),
    ActivitySagas(),
    NetworkSagas(),
    HistorySagas(),
    StrategySagas(),
    TacticalSagas(),
    CacheSagas(),
  ]);
}
