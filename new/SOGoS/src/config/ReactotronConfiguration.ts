import Reactotron from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

const reactoTron = Reactotron.configure({
  name: 'SOGoS',
  host: '172.21.0.1',
})
  // @ts-ignore
  .use(reactotronRedux())
  .connect();

export default reactoTron;
