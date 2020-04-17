import {call, select, put} from 'redux-saga/effects';
import {createReceivedOAuthConfigurations} from '../../events/ConfigurationEvents';
import {initialConfigurationFetchSaga} from './InitialConfigurationSagas';
import {AuthConfiguration} from 'react-native-app-auth';
import {DANGER_ZONE} from '../../util/Configuration';
import {InitialConfig} from '../../types/ConfigurationTypes';
import {isCognito} from '../ConfigurationSagas';
import {SecurityState} from '../../reducers/SecurityReducer';
import {selectSecurityState} from '../../reducers';

export function* securityRequestSaga() {
  const initialConfig: InitialConfig = yield call(
    initialConfigurationFetchSaga,
  );
  const extraScopes = !isCognito(initialConfig) ? ['offline_access'] : [];
  const {identityProvider}: SecurityState = yield select(selectSecurityState);
  const resolvedIdp = identityProvider || '';
  const authConfigurations: AuthConfiguration = {
    issuer: initialConfig.issuer,
    scopes: ['openid', 'profile', 'email', ...extraScopes],
    redirectUrl: 'io.unthrottled.sogos.tacmod:/engage',
    additionalParameters: {
      identity_provider: resolvedIdp,
    },
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
