import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import Banner from '../components/Banner';
import {selectSecurityState} from '../reducers';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {useNavigation} from 'react-navigation-hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaf0',
  },
  googleButton: {
    backgroundColor: '#CB3F22',
    color: '#585858',
    textDecorationColor: '#585858',
    marginTop: 30,
    paddingTop: 5,
    paddingBottom: 5,
  },
  amazonButton: {
    backgroundColor: '#F9AE32',
    color: '#585858',
    textDecorationColor: '#585858',
    marginTop: 30,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

const LoginProviders: FC = () => {
  const dispetch = useDispatch();

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const login = (identityProvider: string) => () => {
    dispetch(createRequestLogonEvent(identityProvider));
  };
  const {isLoggedIn, isLoggingOut, isInitialized} = useSelector(
    selectSecurityState,
  );

  const {navigate} = useNavigation();
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
      <Banner hideExcerpt>
        <Button
          color={'#fff'}
          style={styles.googleButton}
          onPress={login('Google')}>
          Login With Google
        </Button>
        <Button
          color={'#fff'}
          style={styles.amazonButton}
          onPress={login('LoginWithAmazon')}>
          Login With Amazon
        </Button>
      </Banner>
    </View>
  );
};

export default LoginProviders;
