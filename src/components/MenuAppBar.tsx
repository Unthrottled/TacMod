import React, {FC} from 'react';
import {Appbar} from 'react-native-paper';

const MenuAppBar: FC = () => {
  return (
    <Appbar.Header>
      <Appbar.Action icon={'menu'} />
      <Appbar.Action icon={'dots-vertical'} />
    </Appbar.Header>
  );
};

export default MenuAppBar;
