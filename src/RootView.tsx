import LoggedIn from './views/LoggedIn';
import LoggedOut from './views/LoggedOut';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AuthLoading from './views/AuthLoading';
import Settings from './views/Settings';

const AppNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    LoggedIn: LoggedIn,
    Login: LoggedOut,
    Settings: Settings,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);

export default createAppContainer(AppNavigator);
