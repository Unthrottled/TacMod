import Reactotron from 'reactotron-react-native'
import {reactotronRedux} from "reactotron-redux";

const reactoTron = Reactotron
  .configure({
    name: 'SOGoS',
    host: '172.17.0.1'
  })
  .use(reactotronRedux())
  .useReactNative()
  .connect() ;

export default reactoTron;