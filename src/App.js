import React from 'react';

import {Provider} from "react-redux";
import {createStore} from "redux";
import rootReducer from 'reducers'
import RootView from "./RootView";

const store = createStore(rootReducer);

if(__DEV__){
  import('./config/ReactoTronConfig');
}

export default () =>
  <Provider store={store}>
    <RootView/>
  </Provider>