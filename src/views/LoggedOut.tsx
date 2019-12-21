import React, {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {Button, StyleSheet, Text, View} from 'react-native';
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

const LoggedOut: FC = () => {
  const dispetch = useDispatch();

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const login = async () => {
    dispetch(createRequestLogonEvent());
  };
  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  return (
    <View>
      <Text style={styles.welcome}>Welcome to the world of Tomorrow!</Text>
      <Button title={'Login Yo'} onPress={login}>
        Login Yo
      </Button>
    </View>
  );
};

export default LoggedOut;
