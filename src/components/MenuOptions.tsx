import React, {useState} from 'react';
import {Appbar, Menu} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {requestLogoff} from '../events/SecurityEvents';
import {useNavigation} from 'react-navigation-hooks';

const MenuOptions = () => {
  const [open, setOpen] = useState(false);

  const dispetch = useDispatch();
  const {navigate} = useNavigation();
  const logUserOut = (): void => {
    dispetch(requestLogoff());
    navigate({routeName: 'Login'});
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
