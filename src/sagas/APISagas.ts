import {call, select, take} from 'redux-saga/effects';
import axios from 'axios';
import {accessTokenWithSessionExtensionSaga} from './security/AccessTokenSagas';
import {selectConfigurationState} from '../reducers';
import {ConfigurationState} from '../reducers/ConfigurationReducer';
import Stream from '../native/Stream';
import {PayloadEvent} from '../events/Event';
import {InitialConfig} from '../types/ConfigurationTypes';
import {RECEIVED_PARTIAL_INITIAL_CONFIGURATION} from '../events/ConfigurationEvents';
import {UserResponse} from '../types/UserTypes';
import {RECEIVED_USER} from '../events/UserEvents';

export function* performStreamedGet<T>(url: string, options = {headers: {}}) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(Stream.performGet, fullURL, headers);
}

function* getAuthorizationStuff() {
  const {
    user: {
      information: {guid},
    },
    security: {verificationKey},
  } = yield select();
  if (guid && verificationKey) {
    return {guid, verificationKey};
  }

  const {
    payload: {
      information: {guid: userGuid},
      security: {verificationKey: vK},
    },
  }: PayloadEvent<UserResponse> = yield take(RECEIVED_USER);
  return {guid: userGuid, verificationKey: vK};
}

export function* getVerificationStuff(include: boolean = true) {
  if (include) {
    const {guid, verificationKey} = yield call(getAuthorizationStuff);
    return {
      ...(guid ? {'User-Identifier': guid} : {}),
      ...(verificationKey ? {Verification: verificationKey} : {}),
    };
  }

  return {};
}

export function* createHeaders(
  accessTokenSaga: () => any,
  options = {headers: {}},
  includeVerification = true,
) {
  const accessToken = yield call(accessTokenSaga);
  const verificationStuff = yield call(
    getVerificationStuff,
    includeVerification,
  );

  return {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    ...verificationStuff,
  };
}

export function* getConfig() {
  const {
    initial: {apiURL},
  }: ConfigurationState = yield select(selectConfigurationState);
  if (!apiURL) {
    const {
      payload: {apiURL: apiUrl},
    }: PayloadEvent<InitialConfig> = yield take(
      RECEIVED_PARTIAL_INITIAL_CONFIGURATION,
    );
    return apiUrl;
  }
  return apiURL;
}

export function* constructURL(url: String) {
  const apiURL = yield call(getConfig);
  return `${apiURL}${url}`;
}

export function* performGetWithToken(
  url: string,
  options: any,
  accessTokenSaga: () => any,
  includeVerification: boolean = true,
) {
  const headers = yield call(
    createHeaders,
    accessTokenSaga,
    options,
    includeVerification,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(axios.get, fullURL, {
    ...options,
    headers,
  });
}

export function* performGet(url: string, options = {headers: {}}) {
  return yield call(
    performGetWithToken,
    url,
    options,
    accessTokenWithSessionExtensionSaga,
  );
}
export function* performGetWithoutVerification(
  url: string,
  options = {headers: {}},
) {
  return yield call(
    performGetWithToken,
    url,
    options,
    accessTokenWithSessionExtensionSaga,
    false,
  );
}

export function* performGetWithoutSessionExtension(
  url: string,
  options = {headers: {}},
) {
  return yield call(
    performGetWithToken,
    url,
    options,
    accessTokenWithSessionExtensionSaga,
  );
}

export function* performOpenGet(url: string, options = {headers: {}}) {
  const fullURL = yield call(constructURL, url);
  return yield call(axios.get, fullURL, options);
}

export function* performFullOpenGet(fullURL: string, options = {headers: {}}) {
  return yield call(axios.get, fullURL, options);
}

export function* performPost(url: string, data: any, options = {headers: {}}) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(axios.post, fullURL, data, {
    ...options,
    headers,
  });
}

export function* performPut(url: string, data: any, options = {headers: {}}) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(axios.put, fullURL, data, {
    ...options,
    headers,
  });
}

export function* performDelete(
  url: string,
  data: any,
  options = {headers: {}},
) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(axios.delete, fullURL, {
    ...options,
    headers,
    data,
  });
}
