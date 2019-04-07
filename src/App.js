import React from 'react';

import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import rootReducer from 'reducers'
import RootView from "./RootView";
import thunk from "redux-thunk";
import Logger from "./util/Logger";

const middleware = [thunk];

if(__DEV__){
  const reactotron = require('./config/ReactoTronConfig');
}

const store = createStore(rootReducer,
  applyMiddleware(...middleware));

export default () =>
  <Provider store={store}>
    <RootView/>
  </Provider>