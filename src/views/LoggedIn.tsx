import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {Linking, StyleSheet, Text, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {bannerStyles} from '../components/Banner';
import {Caption, Card, Headline, Paragraph} from 'react-native-paper';
import {GlobalState, selectSecurityState, selectUserState} from '../reducers';
import SettingsIcon from '../images/SettingsIcon';
import ActivityTimeBar from '../components/time/ActivityTimeBar';
import PausedPomodoro from '../components/time/PausedPomodoro';
import {useNavigation} from 'react-navigation-hooks';
import TacModIcon from "../images/TacModIcon";

const mapStateToProps = (state: GlobalState) => {
  const {
    information: {fullName, guid},
  } = selectUserState(state);
  const {isInitialized} = selectSecurityState(state);
  return {
    fullName,
    guid,
    isInitialized,
  };
};

const styles = StyleSheet.create({
  banner: {
    marginTop: 30,
    backgroundColor: '#F5FCFF',
    borderRadius: 10,
    margin: 15,
  },
  card: {
    margin: 15,
    borderRadius: 10,
  },
  cardContent: {
    marginRight: 'auto',
    maxWidth: 200,
    padding: 10,
    marginLeft: 'auto',
  },
  cardBullshit: {
    textAlign: 'center',
  },
});

const LoggedIn: FC = () => {
  const {fullName, isInitialized} = useSelector(mapStateToProps);
  const {navigate} = useNavigation();

  const dispetch = useDispatch();
  useEffect(() => {
    if (isInitialized) {
      dispetch(createApplicationInitializedEvent());
    }
  }, [dispetch, isInitialized]);

  return (
    <LoggedInLayout>
      <View
        style={{
          ...bannerStyles.banner,
          ...styles.banner,
        }}>
        <View
          style={{
            ...bannerStyles.container,
          }}>
          <TacModIcon/>
          <Caption style={bannerStyles.secondary}>
            SOGoS's Tactical Module
          </Caption>
          <Paragraph style={bannerStyles.secondary}>
            Welcome{fullName ? ` ${fullName}` : ''}! You know what needs to be
            done thanks to SOGoS. This will help in the execution and
            achievement of your objectives.
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
        </View>
      </View>
      <Card
        style={styles.card}
        onPress={() => {
          navigate({routeName: 'Settings'});
        }}>
        <View style={styles.cardContent}>
          <SettingsIcon/>
          <Headline style={{textAlign: 'center', fontWeight: '300'}}>
            Settings
          </Headline>
          <Paragraph style={{textAlign: 'center', ...bannerStyles.secondary}}>
            Tailor the experience to your abilities.
          </Paragraph>
        </View>
      </Card>
      <ActivityTimeBar/>
      <PausedPomodoro/>
    </LoggedInLayout>
  );
};

export default LoggedIn;
