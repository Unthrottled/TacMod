import {applyMiddleware, createStore, compose} from "redux";
import rootReducer from 'reducers'
import thunk from "redux-thunk";
import {persistReducer, persistStore} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import createSensitiveStorage from "redux-persist-sensitive-storage";

const fetchMiddleware = () =>{
  const commonMiddleware = [thunk];
  if (__DEV__) {
    const reactoTron = require('config/ReactoTronConfig').default;
    return compose(applyMiddleware(...commonMiddleware), reactoTron.createEnhancer());
  }
  return applyMiddleware(...commonMiddleware);
};


export const fetchApplicationConfiguration = () => {
// todo: figure out if you want to safely store tokens and regular store the rest.
  const storage = createSensitiveStorage({
    keychainService: 'sogosKeychain',
    sharedPreferencesName: 'sogosSharedPreferences',
  });

  const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['security'],
  };

  const store = createStore(
    persistReducer(persistConfig, rootReducer),
    fetchMiddleware());


  const persistor = persistStore(store);
  return {
    store,
    persistor
  }
};