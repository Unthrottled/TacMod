import React, {useState} from 'react';
import {Portal, FAB} from 'react-native-paper';
import {theme} from '../App';

const ActivityHub = () => {
  const [open, setOpen] = useState(false);

  return (
    <Portal>
      <FAB.Group
        visible={true}
        open={open}
        fabStyle={{
          backgroundColor: theme.colors.primary,
        }}
        color={theme.colors.text}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'timer',
            label: 'Timed Activity',
            onPress: () => console.log('Pressed add'),
          },
          {
            icon: require('../images/Tomato.png'),
            label: 'Pomodoro Timer',
            onPress: () => console.log('Pressed email'),
          },
        ]}
        onStateChange={({open}) => setOpen(open)}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />
    </Portal>
  );
};

export default ActivityHub;
