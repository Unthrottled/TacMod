import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {GlobalState, selectNetworkState} from '../reducers';
import {useSelector} from 'react-redux';

const mapStateToProps = (state: GlobalState) => {
  const {isOnline, hasInternet} = selectNetworkState(state);
  return {
    isOnline,
    hasInternet,
  };
};

const OfflineMode = () => {
  const {isOnline, hasInternet} = useSelector(mapStateToProps);
  return !(hasInternet && isOnline) ? (
    <MaterialIcon name={'cloud-off'} size={25} />
  ) : null;
};

export default OfflineMode;
