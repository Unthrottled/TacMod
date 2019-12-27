import React, {FC} from 'react';
import {Appbar} from 'react-native-paper';
import MenuOptions from './MenuOptions';
import {View} from 'react-native';

const MenuAppBar: FC = () => {
  return (
    <Appbar.Header>
      <View style={{flex: 1}} />
      <MenuOptions />
    </Appbar.Header>
  );
};

export default MenuAppBar;
