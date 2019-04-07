import Reactotron from 'reactotron-react-native'

Reactotron
  .configure({
    name: 'SOGoS',
    host: '172.17.0.1'
  }) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect() ;// let's connect!