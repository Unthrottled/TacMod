import React from 'react';

import {Provider} from "react-redux";
import RootView from "./RootView";
import {PersistGate} from "redux-persist/lib/integration/react";
import {fetchApplicationConfiguration} from 'config/Configuration'

const {store, persistor} = fetchApplicationConfiguration();

export default () =>
  <Provider store={store}>
    {/*todo: loading indicator*/}
    <PersistGate persistor={persistor}>
      <RootView/>
    </PersistGate>
  </Provider>