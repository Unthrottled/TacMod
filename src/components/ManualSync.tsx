import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import React from 'react';
import {TouchableOpacity} from 'react-native';
import {GlobalState, selectNetworkState, selectUserState} from '../reducers';
import {useDispatch, useSelector} from 'react-redux';
import {createRequestedSyncEvent} from '../events/UserEvents';

const mapStateToProps = (state: GlobalState) => {
  const {isOnline} = selectNetworkState(state);
  const {
    miscellaneous: {hasItemsCached},
  } = selectUserState(state);
  return {
    isOnline,
    hasItemsCached,
  };
};

const ManualSync = () => {
  const {isOnline, hasItemsCached} = useSelector(mapStateToProps);

  const shouldDisplay = isOnline && hasItemsCached;

  const dispetch = useDispatch();

  return shouldDisplay ? (
    <TouchableOpacity onPress={() => dispetch(createRequestedSyncEvent())}>
      <MaterialIcon name={'sync'} size={25}/>
    </TouchableOpacity>
  ) : null;
};

export default ManualSync;
