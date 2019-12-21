import {call, select, take} from 'redux-saga/effects';
import {buffers, END, eventChannel} from 'redux-saga';
import axios from 'axios';
import oboe from 'oboe';
import {
  accessTokenWithSessionExtensionSaga,
} from './security/AccessTokenSagas';
import {selectConfigurationState} from '../reducers';
import {ConfigurationState} from '../reducers/ConfigurationReducer';

const SHITS_BROKE_YO: string = "SHIT'S BROKE YO";

type ChannelParameters = {url: string; method: string; headers: any; body: any};
export const createStreamChannel = ({
  url,
  method,
  headers,
  body,
}: ChannelParameters) => {
  return eventChannel(statusObserver => {
    const requestStream = oboe({
      url,
      method,
      headers,
      body,
      cached: false,
      withCredentials: true,
    })
      .done((jsonThingo: any) => {
        statusObserver(jsonThingo);
      })
      .fail((error: any) => {
        console.log('Error streaming', error);
        statusObserver(SHITS_BROKE_YO);
        statusObserver(END);
      })
      .on('end', () => {
        statusObserver(END);
      });
    return () => requestStream.abort();
  }, buffers.expanding(100));
};

export function* performStreamedGet<T>(url: String, options = {headers: {}}) {
  const headers = yield call(
    createHeaders,
    accessTokenWithSessionExtensionSaga,
    options,
  );
  const fullURL = yield call(constructURL, url);
  const streamChannel = yield call(createStreamChannel, {
    url: fullURL,
    method: 'GET',
    headers,
    body: '',
  });
  const aggregate = [];
  let error;
  try {
    while (true) {
      const itemChunk = yield take(streamChannel);
      if (itemChunk !== SHITS_BROKE_YO) {
        aggregate.unshift(itemChunk);
      } else {
        error = itemChunk;
      }
    }
  } finally {
    if (!error) {
      return aggregate; //dis dumb
    } else {
      throw new Error('yeet');
    }
  }
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

export function* constructURL(url: String) {
  const {
    initial: {apiURL},
  }: ConfigurationState = yield select(selectConfigurationState);
  return `${apiURL || ''}${url}`;
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
