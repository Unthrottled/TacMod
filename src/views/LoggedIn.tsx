import React, {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {requestLogoff} from '../events/SecurityEvents';
import {Button, Text, View} from 'react-native';

const LoggedIn: FC = () => {
  const dispetch = useDispatch();

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const logout = async () => {
    try {
      dispetch(requestLogoff());
    } catch (e) {
      console.warn('Shit broke yo', e.message);
    }
  };

  return (
    <View>
      <Text>You are logged in, Hurray!!</Text>
      <Button title={'Logout'} onPress={logout} />
    </View>
  );
};

export default LoggedIn;
