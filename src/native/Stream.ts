import {NativeModules} from 'react-native';
//todo: ios if you wanna.

interface Streamo {
  performGet: <T>(url: string) => Promise<T>;
}
export default NativeModules.Stream as Streamo;
