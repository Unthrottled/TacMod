import React, {FC} from 'react';
import {Appbar} from 'react-native-paper';
import MenuOptions from './MenuOptions';
import {View} from 'react-native';
import ManualSync from './ManualSync';

const MenuAppBar: FC = () => {
  return (
    <Appbar.Header>
      <ManualSync />
      <View style={{flex: 1}} />
      <MenuOptions />
    </Appbar.Header>
  );
};

export default MenuAppBar;
