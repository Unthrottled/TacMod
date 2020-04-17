import React, {FC} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {Caption, Paragraph} from 'react-native-paper';
import TacModIcon from '../images/TacModIcon';

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
  sogosLink: {
    marginTop: 10,
    marginBottom: 10,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#3f41ff',
  },
});

interface Props {
  hideExcerpt?: boolean;
}

const Banner: FC<Props> = ({hideExcerpt, children}) => (
  <View style={bannerStyles.banner}>
    <View style={bannerStyles.container}>
      <TacModIcon />
      <Caption style={bannerStyles.secondary}>SOGoS's Tactical Module</Caption>
      {!hideExcerpt && (
        <>
          <Paragraph style={bannerStyles.secondary}>
            You know what needs to be done thanks to SOGoS. This will help in
            the execution and achievement of your objectives.
          </Paragraph>
          <Paragraph style={[bannerStyles.secondary, bannerStyles.sogosLink]}>
            Use{' '}
            <Text
              onPress={() => Linking.openURL('https://sogos.unthrottled.io')}
              style={bannerStyles.link}>
              sogos.unthrottled.io
            </Text>{' '}
            for strategic management
          </Paragraph>
        </>
      )}
      {children}
    </View>
  </View>
);

export default Banner;
