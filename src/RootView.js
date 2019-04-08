import React, {Component} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {authorize} from "react-native-app-auth/index";
import axios from 'axios/index';
import {connect} from "react-redux";
import {loggedInAction, loggedOutAction} from "./actions";

const issuer = 'http://172.17.0.1:8080/auth/realms/master';
const revocationEndpoint = `${issuer}/protocol/openid-connect/logout`;
const clientId = 'sogos-app';
const configuration = {
  issuer,
  clientId,
  redirectUrl: 'io.acari.sogos:/engage',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  additionalParameters: {
    prompt: 'login',
  },
  serviceConfiguration: {
    authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
    revocationEndpoint,
  },
  dangerouslyAllowInsecureHttpRequests: true,//todo: remove dis
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
  return axios.post(revocationEndpoint,
    `client_id=${clientId}&refresh_token=${refreshToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
};

class RootView extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    refreshToken: PropTypes.string.isRequired,
    accessToken: PropTypes.string.isRequired,
  };

  logout = async () => {
    try {
      const {refreshToken, accessToken} = this.props;
      // todo: refresh access token before logging out
      await revokeToken(accessToken, refreshToken);
      const {dispatch: dispetch} = this.props;
      dispetch(loggedOutAction())
    } catch (e) {
      console.warn('Shit broke yo', e.message);
    }
  };

  login = async () => {
    try {
      const authState = await authorize(configuration);
      const {dispatch: dispetch} = this.props;
      dispetch(loggedInAction(authState))
    } catch (error) {
      console.warn(`Shit broke yo`, error)
    }
  };

  render() {
    const {isLoggedIn} = this.props;
    return (
      <View style={styles.container}>
        {
          isLoggedIn ?
            <View>
              <Text>You are logged in, Hurray!!</Text>
              <Button title={'Logout'} onPress={this.logout}/>
            </View> :
            <View>
              <Text style={styles.welcome}>Welcome to the world of Tomorrow!</Text>
              <Button title={'Login Yo'} onPress={this.login}>Login Yo</Button>
            </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) =>
  ({
    accessToken: state.security.accessToken,
    refreshToken: state.security.refreshToken,
    idToken: state.security.idToken,
    isLoggedIn: state.security.isLoggedIn,
  });

export default connect(mapStateToProps)(RootView)