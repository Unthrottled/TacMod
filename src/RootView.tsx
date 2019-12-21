import React, {FC, useEffect} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {selectSecurityState} from './reducers';
import {createRequestLogonEvent, requestLogoff} from './events/SecurityEvents';
import {createApplicationInitializedEvent} from './events/ApplicationLifecycleEvents';

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

const RootView: FC = () => {
  const {isLoggedIn} = useSelector(selectSecurityState);
  const dispetch = useDispatch();

  const logout = async () => {
    try {
      dispetch(requestLogoff());
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
