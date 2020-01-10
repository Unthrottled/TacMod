import React, {FC} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {fetchApplicationConfiguration} from './config/Configuration';
import RootView from './RootView';
import {Provider as PaperProvider} from 'react-native-paper';
import {theme} from './Theme';

const {store, persistor} = fetchApplicationConfiguration();

const App: FC = () => {
  return (
    <>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <PaperProvider theme={theme}>
            <RootView />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
