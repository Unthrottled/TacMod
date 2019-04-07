import React, {Component} from 'react';
import {Button, Platform, StyleSheet, Text, View} from 'react-native';
import {authorize} from "react-native-app-auth";

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const issuer = 'http://192.168.43.44:8080/auth/realms/master';
const configuration = {
  issuer,
  clientId: 'sogos-app',
  redirectUrl: 'io.acari.sogos:/engage',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  additionalParameters: {
    prompt: 'login',
  },
  serviceConfiguration: {
    authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
    revocationEndpoint: `${issuer}/protocol/openid-connect/logout`,
  },
  dangerouslyAllowInsecureHttpRequests: true,//todo: remove dis
};

type Props = {};
export default class App extends Component<Props> {

  state = {
    loggedIn : false,
  };

  login = async () => {
    try {
      const appAuth = authorize(configuration);
      this.setState({loggedIn: true, appAuth})
    } catch (error) {
      console.warn(`Shit broke yo`, error)
    }
  };

  render() {
    const {loggedIn} = this.state;
    return (
      <View style={styles.container}>
        {
          loggedIn ?
            <View>
              <Text>You are logged in, Hurray!!</Text>
            </View> :
            <View>
              <Text style={styles.welcome}>Welcome to React Native!</Text>
              <Text style={styles.instructions}>To get started, edit App.js</Text>
              <Text style={styles.instructions}>{instructions}</Text>
              <Button title={'Login Yo'} onPress={this.login}>Login Yo</Button>
            </View>
        }
      </View>
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
