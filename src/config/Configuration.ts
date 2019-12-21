import {applyMiddleware, compose, createStore} from 'redux';
import omit from 'lodash/omit';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';
import {createTransform, persistReducer, persistStore} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-community/async-storage';

const fetchMiddleware = (sagaMiddleware: any) => {
  const commonMiddleware = [thunk, sagaMiddleware];
  if (process.env.NODE_ENV === 'development') {
    const reactoTron = require('./ReactotronConfiguration').default;
    return compose(
      applyMiddleware(...commonMiddleware),
      reactoTron.createEnhancer(),
    );
  }
  return applyMiddleware(...commonMiddleware);
};

const blackListTransform = createTransform((inboundState: any, key) => {
  if (key === 'security') {
    return omit(inboundState, ['isInitialized', 'isOutOfSync']);
  } else if (key === 'misc') {
    return omit(inboundState, ['notification']);
  } else {
    return inboundState;
  }
});

export const fetchApplicationConfiguration = () => {
  const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['security', 'user', 'activity', 'strategy', 'tactical', 'misc'],
    transforms: [blackListTransform],
  };

  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    persistReducer(persistConfig, rootReducer()),
    fetchMiddleware(sagaMiddleware),
  );
  sagaMiddleware.run(rootSaga);

  const persistor = persistStore(store);

  return {
    store,
    persistor,
  };
};
