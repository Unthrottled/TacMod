import {call, select, take} from 'redux-saga/effects';
import {buffers, END, eventChannel} from 'redux-saga';
import axios from 'axios';
import oboe from 'oboe';
import {accessTokenWithSessionExtensionSaga} from './security/AccessTokenSagas';
import {selectConfigurationState} from '../reducers';
import {ConfigurationState} from '../reducers/ConfigurationReducer';
import Stream from '../native/Stream';
import {PayloadEvent} from '../events/Event';
import {InitialConfig} from '../types/ConfigurationTypes';
import {RECEIVED_PARTIAL_INITIAL_CONFIGURATION} from '../events/ConfigurationEvents';

export function* performStreamedGet<T>(url: String, options = {headers: {}}) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  return yield call(Stream.performGet, fullURL, headers);
}

export function* createHeaders(
  accessTokenSaga: () => any,
  options = {headers: {}},
) {
  const accessToken = yield call(accessTokenSaga);
  const {
    user: {
      information: {guid},
    },
    security: {verificationKey},
  } = yield select();
  return {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    ...(guid ? {'User-Identifier': guid} : {}),
    ...(verificationKey ? {Verification: verificationKey} : {}),
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
) {
  const headers = yield call(createHeaders, accessTokenSaga, options);
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
