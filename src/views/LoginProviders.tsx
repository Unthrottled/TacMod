import React, {FC} from 'react';
import {useDispatch} from 'react-redux';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';
import Banner from '../components/Banner';

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
  const login = (identityProvider: string) => () => {
    dispetch(createRequestLogonEvent(identityProvider));
  };

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
