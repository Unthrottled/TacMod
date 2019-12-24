import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import MenuAppBar from './MenuAppBar';
import ActivityHub from "./time/ActivityHub";
const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
});
const LoggedInLayout: FC = ({children, ...otherProperties}) => (
  <View {...otherProperties} style={styles.container}>
    <MenuAppBar />
    <ActivityHub/>
    {children}
  </View>
);

export default LoggedInLayout;
