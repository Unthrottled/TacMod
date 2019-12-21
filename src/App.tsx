import React, {FC} from 'react';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {fetchApplicationConfiguration} from './config/Configuration';
import RootView from './RootView';
import {Provider as PaperProvider} from 'react-native-paper';

const {store, persistor} = fetchApplicationConfiguration();
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.dark,
    height: '100%',
  },
});
const App: FC = () => {
  return (
    <>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <PaperProvider>
            <RootView />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
