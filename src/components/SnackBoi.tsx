import * as React from 'react';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {FC} from 'react';
import {connect, DispatchProp, useDispatch, useSelector} from 'react-redux';
import {GlobalState, selectMiscState} from '../reducers';
import {IconButton, Snackbar, Text} from 'react-native-paper';
import {createHideNotificationEvent} from '../events/MiscEvents';
import {View} from 'react-native';

const SnackBoi: FC = () => {
  const {message, shown} = useSelector(mapStateToProps);
  const dispatch = useDispatch();
  const onClose = () => {
    dispatch(createHideNotificationEvent());
  };

  return (
    <View>
      <Snackbar
        visible={shown}
        style={{
          backgroundColor: 'red'
        }}
        onDismiss={onClose}>
        {message}
      </Snackbar>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const {
    notification: {message, shown},
  } = selectMiscState(state);
  return {
    message,
    shown,
  };
};

export default connect(mapStateToProps)(SnackBoi);
