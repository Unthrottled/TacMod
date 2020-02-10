import {call, put} from 'redux-saga/effects';
import {createReceivedOAuthConfigurations} from '../../events/ConfigurationEvents';
import {initialConfigurationFetchSaga} from './InitialConfigurationSagas';
import {AuthConfiguration} from 'react-native-app-auth';
import {DANGER_ZONE} from '../../util/Configuration';
import {InitialConfig} from '../../types/ConfigurationTypes';

export function* securityRequestSaga() {
  const initialConfig: InitialConfig = yield call(
    initialConfigurationFetchSaga,
  );
  const authConfigurations: AuthConfiguration = {
    issuer: initialConfig.issuer,
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    redirectUrl: 'io.unthrottled.sogos.tacmod:/engage',
    additionalParameters: {},
    serviceConfiguration: {
      authorizationEndpoint: initialConfig.authorizationEndpoint,
      tokenEndpoint: initialConfig.tokenEndpoint,
    },
    usePKCE: true,
    clientId: initialConfig.appClientID,
    dangerouslyAllowInsecureHttpRequests: DANGER_ZONE,
  };
  yield put(createReceivedOAuthConfigurations(authConfigurations));
}
