import React, {FC} from 'react';
import {View} from 'react-native';
import MenuAppBar from './MenuAppBar';

const LoggedInLayout: FC = ({children, ...otherProperties}) => (
  <View {...otherProperties}>
    <MenuAppBar />
    {children}
  </View>
);

export default LoggedInLayout;
