import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {selectSecurityState} from './reducers';
import LoggedIn from './views/LoggedIn';
import LoggedOut from './views/LoggedOut';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeaf0',
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
