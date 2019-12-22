import React, {FC} from 'react';
import {Appbar} from 'react-native-paper';
import MenuOptions from './MenuOptions';

const MenuAppBar: FC = () => {
  return (
    <Appbar.Header>
      <Appbar.Action icon={'menu'} />
      <MenuOptions />
    </Appbar.Header>
  );
};

export default MenuAppBar;
