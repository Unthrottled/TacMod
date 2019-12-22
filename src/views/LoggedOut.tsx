import React, {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import Banner from '../components/Banner';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e49d2c',
    color: '#585858',
    textDecorationColor: '#585858',
    paddingTop: 5,
    paddingBottom: 5,
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
    <>
      <Banner>
        <Button color={'#585858'} style={styles.button} onPress={login}>
          Start Using SOGoS!
        </Button>
      </Banner>
    </>
  );
};

export default LoggedOut;
