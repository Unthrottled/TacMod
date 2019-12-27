import React, {FC} from 'react';
import {Appbar} from 'react-native-paper';
import MenuOptions from './MenuOptions';
import {View} from 'react-native';
import ManualSync from './ManualSync';
import OfflineMode from './OfflineMode';

const MenuAppBar: FC = () => {
  return (
    <Appbar.Header>
      <ManualSync />
      <OfflineMode />
      <View style={{flex: 1}} />
      <MenuOptions />
    </Appbar.Header>
  );
};

export default MenuAppBar;
