import LoggedIn from './views/LoggedIn';
import LoggedOut from './views/LoggedOut';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AuthLoading from './views/AuthLoading';
import Settings from './views/Settings';
import LoginProviders from './views/LoginProviders';

const AppNavigator = createSwitchNavigator(
  {
    AuthLoading,
    LoggedIn: LoggedIn,
    Login: LoggedOut,
    Settings,
    LoginProviders,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);

export default createAppContainer(AppNavigator);
