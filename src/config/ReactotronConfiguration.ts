import Reactotron from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

declare global {
  interface Console {
    tron: any;
  }
}

const reactoTron = Reactotron.configure({
  name: 'TacMod',
  host: '172.17.0.1',
})
  .useReactNative()
  .use(reactotronRedux())
  .connect();

console.tron = reactoTron.log;

export default reactoTron;
