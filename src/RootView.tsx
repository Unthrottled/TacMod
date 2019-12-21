import React, {FC, useEffect} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {revoke} from 'react-native-app-auth/index';
import axios from 'axios/index';
import {useDispatch, useSelector} from 'react-redux';
import {loggedOutAction} from './actions';
import {selectSecurityState} from './reducers';
import {AuthConfiguration} from 'react-native-app-auth';
import {createRequestLogonEvent} from './events/SecurityEvents';
import {createApplicationInitializedEvent} from './events/ApplicationLifecycleEvents';

const issuer = 'http://172.21.0.1:8080/auth/realms/master';
const revocationEndpoint = `${issuer}/protocol/openid-connect/logout`;
const clientId = 'sogos-app';
const configuration: AuthConfiguration = {
  issuer,
  clientId,
  redirectUrl: 'io.acari.sogos:/engage',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  additionalParameters: {
    prompt: 'login',
  },
  dangerouslyAllowInsecureHttpRequests: true, //todo: remove dis
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

const revokeToken = async (accessToken: String, refreshToken: String) => {
  return axios.post(
    revocationEndpoint,
    `client_id=${clientId}&refresh_token=${refreshToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
};

const RootView: FC = () => {
  const {isLoggedIn, refreshToken, accessToken} = useSelector(
    selectSecurityState,
  );
  const dispetch = useDispatch();

  const logout = async () => {
    try {
      await revoke(configuration, {
        tokenToRevoke: refreshToken,
      });
      dispetch(loggedOutAction());
    } catch (e) {
      console.warn('Shit broke yo', e.message);
    }
  };

  const login = async () => {
    dispetch(createRequestLogonEvent());
  };
  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  return (
    <>
      <View style={styles.container}>
        {isLoggedIn ? (
          <View>
            <Text>You are logged in, Hurray!!</Text>
            <Button title={'Logout'} onPress={logout} />
          </View>
        ) : (
          <View>
            <Text style={styles.welcome}>
              Welcome to the world of Tomorrow!
            </Text>
            <Button title={'Login Yo'} onPress={login}>
              Login Yo
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default RootView;
