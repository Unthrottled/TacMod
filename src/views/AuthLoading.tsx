import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {selectSecurityState} from '../reducers';
import {useNavigation} from 'react-navigation-hooks';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';

const styles = StyleSheet.create({
  container: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
});

const AuthLoading = () => {
  const {isLoggedIn, isInitialized} = useSelector(selectSecurityState);
  const {navigate} = useNavigation();
  const dispetch = useDispatch();
  useEffect(() => {
    if (isInitialized) {
      dispetch(createApplicationInitializedEvent());
    }
    navigate(isLoggedIn ? 'LoggedIn' : 'Login');
  }, [dispetch, isInitialized, isLoggedIn, navigate]);
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'}/>
    </View>
  );
};

export default AuthLoading;
