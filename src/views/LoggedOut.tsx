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
    backgroundColor: '#8ab72d',
    color: '#585858',
    textDecorationColor: '#585858',
    marginTop: 30,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

const LoggedOut: FC = () => {
  const dispetch = useDispatch();

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const {navigate} = useNavigation();
  const login = async () => {
    navigate({routeName: 'LoginProviders'});
  };
  const {isLoggedIn, isLoggingOut, isInitialized} = useSelector(
    selectSecurityState,
  );
  useEffect(() => {
    if (!isInitialized) {
      dispetch(createApplicationInitializedEvent());
    }
    if (isLoggedIn && !isLoggingOut) {
      navigate({routeName: 'AuthLoading'});
    }
  }, [dispetch, isInitialized, isLoggedIn, isLoggingOut, navigate]);

  return (
    <View style={styles.container}>
      <Banner>
        <Button color={'#585858'} style={styles.button} onPress={login}>
          Get Tactical!
        </Button>
      </Banner>
    </View>
  );
};

export default LoggedOut;
