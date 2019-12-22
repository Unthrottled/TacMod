import React, {useState} from 'react';
import {View} from 'react-native';
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
          backgroundColor: theme.colors.primary
        }}
        color={theme.colors.text}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'plus',
            label: 'ya boi',
            onPress: () => console.log('Pressed add'),
          },
          {
            icon: 'email',
            label: 'Email',
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
