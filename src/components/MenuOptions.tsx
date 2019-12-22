import React, {useState} from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {requestLogoff} from '../events/SecurityEvents';

const MenuOptions = () => {
  const [open, setOpen] = useState(false);

  const dispetch = useDispatch();
  const logUserOut = (): void => {
    dispetch(requestLogoff());
  };

  const navigateToSettings = () => {
    setOpen(false);
  };

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Appbar.Action icon={'dots-vertical'} onPress={() => setOpen(true)} />
      }>
      <Menu.Item onPress={navigateToSettings} title={'Settings'} />
      <Menu.Item onPress={logUserOut} title={'Logout'} />
    </Menu>
  );
};

export default MenuOptions;
