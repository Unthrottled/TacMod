import React, {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {requestLogoff} from '../events/SecurityEvents';
import {Button, Text, View} from 'react-native';
import LoggedInLayout from "../components/LoggedInLayout";

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
    <LoggedInLayout>
      <Text>You are logged in, Hurray!!</Text>
      <Button title={'Logout'} onPress={logout} />
    </LoggedInLayout>
  );
};

export default LoggedIn;
