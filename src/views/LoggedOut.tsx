import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import Banner from '../components/Banner';
import {useNavigation} from 'react-navigation-hooks';
import {selectSecurityState} from '../reducers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaf0',
  },
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

  const {isLoggedIn} = useSelector(selectSecurityState);
  const {navigate} = useNavigation();
  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
    if (isLoggedIn) {
      navigate({routeName: 'AuthLoading'});
    }
  }, [dispetch, isLoggedIn, navigate]);

  return (
    <View style={styles.container}>
      <Banner>
        <Button color={'#585858'} style={styles.button} onPress={login}>
          Start Using SOGoS!
        </Button>
      </Banner>
    </View>
  );
};

export default LoggedOut;
