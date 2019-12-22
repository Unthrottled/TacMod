import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReachIcon from '../images/ReachIcon';
import {Caption, Paragraph} from 'react-native-paper';

export const bannerStyles = StyleSheet.create({
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
  <View style={bannerStyles.banner}>
    <View style={bannerStyles.container}>
      <Text style={{fontSize: 35}}>SOGoS</Text>
      <Caption style={bannerStyles.secondary}>
        Strategic Orchestration and Governance System
      </Caption>
      <Paragraph style={bannerStyles.secondary}>
        Find and reach your maximum potential! Push yourself to the limits of
        your ability. Knowing you rest easy when you really need to.
      </Paragraph>
      <ReachIcon />
      {children}
    </View>
  </View>
);

export default Banner;
