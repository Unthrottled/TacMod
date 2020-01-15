import Reactotron from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

const reactoTron = Reactotron.configure({
  name: 'TacMod',
  host: '172.17.0.1',
})
  .useReactNative()
  .use(reactotronRedux())
  .connect();

export default reactoTron;
