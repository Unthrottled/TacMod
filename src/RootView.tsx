import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {selectSecurityState} from './reducers';
import LoggedIn from './views/LoggedIn';
import LoggedOut from './views/LoggedOut';

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

const RootView: FC = () => {
  const {isLoggedIn} = useSelector(selectSecurityState);
  return (
    <>
      <View style={styles.container}>
        {isLoggedIn ? <LoggedIn /> : <LoggedOut />}
      </View>
    </>
  );
};

export default RootView;
