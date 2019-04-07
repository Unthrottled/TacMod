import React, {Component} from 'react';
import {Button, Platform, StyleSheet, Text, View} from 'react-native';
import {authorize} from "react-native-app-auth/index";
import axios from 'axios/index';
import {Provider, connect} from "react-redux";
import {createStore} from "redux";
import rootReducer from 'reducers'

const store = createStore(rootReducer);

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

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

type Props = {};
class RootView extends Component<Props> {

  state = {
    loggedIn: false,
    refreshToken: '',
    accessToken: '',
  };

  logout = async () => {
    try {
      const {refreshToken, accessToken} = this.state;
      // todo: refresh access token before logging out
      await revokeToken(accessToken, refreshToken);
      this.setState({loggedIn: false})
    } catch (e) {
      console.warn('Shit broke yo', e.message);
    }
  };

  login = async () => {
    try {
      const {refreshToken, accessToken} = await authorize(configuration);
      this.setState({loggedIn: true, refreshToken, accessToken})
    } catch (error) {
      console.warn(`Shit broke yo`, error)
    }
  };

  render() {
    const {loggedIn} = this.state;
    return (
      <Provider store={store}>
        <View style={styles.container}>
          {
            loggedIn ?
              <View>
                <Text>You are logged in, Hurray!!</Text>
                <Button title={'Logout'} onPress={this.logout}/>
              </View> :
              <View>
                <Text style={styles.welcome}>Welcome to React Native!</Text>
                <Text style={styles.instructions}>To get started, edit App.js</Text>
                <Text style={styles.instructions}>{instructions}</Text>
                <Button title={'Login Yo'} onPress={this.login}>Login Yo</Button>
              </View>
          }
        </View>
      </Provider>
    );
  }
}

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

const mapStateToProps = (state) =>
  ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    idToken: state.idToken,
    isLoggedIn: state.isLoggedIn,
  });



export default connect(mapStateToProps)(RootView)