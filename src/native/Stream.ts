import {NativeModules} from 'react-native';

interface Streamo {
  performGet: <T>(url: string, headers: { [key: string]: any }) => Promise<T>;
}

export default NativeModules.Stream as Streamo;
