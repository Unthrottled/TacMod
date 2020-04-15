import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import MenuAppBar from './MenuAppBar';
import ActivityHub from "./time/ActivityHub";
import SnackBoi from "./SnackBoi";

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#f5fcff',
  },
});
const LoggedInLayout: FC = ({children, ...otherProperties}) => (
  <View {...otherProperties} style={styles.container}>
    <MenuAppBar/>
    <ActivityHub/>
    {children}
    <SnackBoi/>
  </View>
);

export default LoggedInLayout;
