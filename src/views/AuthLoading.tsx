import React, {useEffect} from 'react';
import {StatusBar, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {selectSecurityState} from '../reducers';
import {useNavigation} from 'react-navigation-hooks';

const AuthLoading = () => {
  const {isLoggedIn} = useSelector(selectSecurityState);
  const {navigate} = useNavigation();
  useEffect(() => {
    navigate(isLoggedIn ? 'LoggedIn' : 'Login');
  }, [isLoggedIn, navigate]);
  return (
    <View>
      <ActivityIndicator />
      <StatusBar barStyle={'default'} />
    </View>
  );
};

export default AuthLoading;
