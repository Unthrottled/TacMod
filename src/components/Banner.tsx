import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReachIcon from '../images/ReachIcon';
import {Caption, Paragraph} from 'react-native-paper';

const styles = StyleSheet.create({
  parent: {
    height: '100%',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    backgroundColor: '#F5FCFF',
  },
  banner: {
    marginTop: 'auto',
    marginBottom: 'auto',
    backgroundColor: '#F5FCFF',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    margin: 15,
    maxHeight: 400,
  },
  secondary: {
    color: 'slategrey',
    textAlign: 'center',
  },
});

const Banner: FC = ({children}) => (
  <View style={styles.banner}>
    <View style={styles.container}>
      <Text style={{fontSize: 35}}>SOGoS</Text>
      <Caption style={styles.secondary}>
        Strategic Orchestration and Governance System
      </Caption>
      <Paragraph style={styles.secondary}>
        Find and reach your maximum potential! Push yourself to the limits of
        your ability. Knowing you rest easy when you really need to.
      </Paragraph>
      <ReachIcon />
      {children}
    </View>
  </View>
);

export default Banner;
