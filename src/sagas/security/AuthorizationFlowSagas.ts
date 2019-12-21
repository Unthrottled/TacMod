import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationRequestHandler,
  AuthorizationRequestResponse,
  GRANT_TYPE_AUTHORIZATION_CODE,
  RedirectRequestHandler,
  TokenRequest,
} from '@openid/appauth';
import {push} from 'connected-react-router';
import {NodeCrypto} from '@openid/appauth/built/node_support/';
import {
  createCheckedAuthorizationEvent,
  createLoggedOnAction,
  FAILED_TO_RECEIVE_TOKEN,
  RECEIVED_TOKENS,
} from '../../events/SecurityEvents';
import {call, fork, put, race, select, take} from 'redux-saga/effects';
import {completeAuthorizationRequest} from '../../security/StupidShit';
import {
  createRequestForInitialConfigurations,
  FOUND_INITIAL_CONFIGURATION,
} from '../../events/ConfigurationEvents';
import {fetchTokenWithRefreshSaga} from './TokenSagas';
import {oauthConfigurationSaga} from '../configuration/ConfigurationConvienenceSagas';
import {OAuthConfig} from '../../types/ConfigurationTypes';
import {createSaveRedirect} from '../../events/MiscEvents';
import {MiscellaneousState} from '../../reducers/MiscellaneousReducer';
import {selectMiscState} from '../../reducers';

export function* authorizationGrantSaga() {
  yield call(performAuthorizationGrantFlowSaga, false);
  yield put(createCheckedAuthorizationEvent());
}

export function* loginSaga() {
  yield call(performAuthorizationGrantFlowSaga, true);
}

export function constructAuthorizationRequestHandler(): Promise<
  AuthorizationRequestHandler
> {
  const notifier = new AuthorizationNotifier();
  const authorizationHandler = new RedirectRequestHandler();
  return Promise.resolve(
    authorizationHandler.setAuthorizationNotifier(notifier),
  );
}

export function performAuthorizationRequest(
  authorizationHandler: AuthorizationRequestHandler,
  oauthConfig: OAuthConfig,
  authorizationRequest: AuthorizationRequest,
): Promise<void> {
  // @ts-ignore real
  return Promise.resolve(
    authorizationHandler.performAuthorizationRequest(
      oauthConfig,
      authorizationRequest,
    ),
  );
}

// Thanks shitty library API design
export function* performAuthorizationGrantFlowSaga(
  shouldRequestLogon: boolean,
) {
  const oauthConfig = yield call(oauthConfigurationSaga);
  const authorizationHandler: AuthorizationRequestHandler = yield call(
    constructAuthorizationRequestHandler,
  );
  const authorizationResult: AuthorizationRequestResponse =
    // @ts-ignore real
    yield call(completeAuthorizationRequest, authorizationHandler);
  if (authorizationResult) {
    const {request, response} = authorizationResult;
    // @ts-ignore real
    const tokenRequest = yield call(
      constructAuthorizationCodeGrantRequest,
      request,
      response,
    );
    yield call(
      exchangeAuthorizationGrantForAccessToken,
      tokenRequest,
      oauthConfig,
    );
  } else if (shouldRequestLogon) {
    const scope = 'openid profile email';
    yield put(createRequestForInitialConfigurations());
    const {payload: initialConfigurations} = yield take(
      FOUND_INITIAL_CONFIGURATION,
    );
    yield put(createSaveRedirect(window.location.pathname));
    const authorizationRequest = new AuthorizationRequest(
      {
        client_id: initialConfigurations.clientID,
        redirect_uri: initialConfigurations.callbackURI,
        scope,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      },
      new NodeCrypto(),
    );
    yield call(
      performAuthorizationRequest,
      authorizationHandler,
      oauthConfig,
      authorizationRequest,
    );
  }
}

export function* constructAuthorizationCodeGrantRequest(
  request: {internal: {code_verifier: any}},
  response: {code: any},
) {
  const code = response.code;
  const codeVerifier = request.internal && request.internal.code_verifier;
  yield put(createRequestForInitialConfigurations());
  const {payload: initialConfigurations} = yield take(
    FOUND_INITIAL_CONFIGURATION,
  );
  return new TokenRequest({
    client_id: initialConfigurations.clientID,
    redirect_uri: initialConfigurations.callbackURI,
    grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
    code,
    extras: {
      code_verifier: codeVerifier,
    },
  });
}

export function* exchangeAuthorizationGrantForAccessToken(
  tokenRequest: TokenRequest,
  oauthConfig: any,
) {
  yield fork(fetchTokenWithRefreshSaga, oauthConfig, tokenRequest);
  const {tokenReception} = yield race({
    tokenReception: take(RECEIVED_TOKENS),
    tokenFailure: take(FAILED_TO_RECEIVE_TOKEN),
  });

  if (tokenReception) {
    const {redirectPath}: MiscellaneousState = yield select(selectMiscState);
    yield put(push(redirectPath));
    yield put(createLoggedOnAction());
  }
}
