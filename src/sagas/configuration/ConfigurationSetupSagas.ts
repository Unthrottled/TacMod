import {call, put} from 'redux-saga/effects';
import {createReceivedRemoteOAuthConfigurations} from '../../events/ConfigurationEvents';
import {initialConfigurationFetchSaga} from './InitialConfigurationSagas';
import {InitialConfig, OAuthConfig} from '../../types/ConfigurationTypes';

export function* authorizationServiceConfigurationSaga() {
  const initialConfigurations: InitialConfig = yield call(
    initialConfigurationFetchSaga,
  );
  const oAuthConfigs: OAuthConfig = {
    revocationEndpoint: initialConfigurations.logoutEndpoint,
    authorizationEndpoint: initialConfigurations.authorizationEndpoint,
    endSessionEndpoint: initialConfigurations.logoutEndpoint,
    tokenEndpoint: initialConfigurations.tokenEndpoint,
    userInfoEndpoint: initialConfigurations.userInfoEndpoint,
  };
  yield put(createReceivedRemoteOAuthConfigurations(oAuthConfigs));
}
