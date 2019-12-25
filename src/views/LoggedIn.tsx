import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {StyleSheet, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {bannerStyles} from '../components/Banner';
import {Caption, Card, Headline, Paragraph} from 'react-native-paper';
import ReachIcon from '../images/ReachIcon';
import {GlobalState, selectUserState} from '../reducers';
import PushNotification from 'react-native-push-notification';
import SettingsIcon from '../images/SettingsIcon';
import ActivityTimeBar from '../components/time/ActivityTimeBar';
import PausedPomodoro from '../components/time/PausedPomodoro';

const mapStateToProps = (state: GlobalState) => {
  const {
    information: {fullName, guid},
  } = selectUserState(state);
  return {
    fullName,
    guid,
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
  const dispetch = useDispatch();
  const {fullName, guid} = useSelector(mapStateToProps);

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

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
          <Headline>SOGoS</Headline>
          <Caption style={bannerStyles.secondary}>
            Strategic Orchestration and Governance System
          </Caption>
          <Paragraph style={bannerStyles.secondary}>
            Welcome{fullName ? ` ${fullName}` : ''}! Figure out where you want
            to excel. Then push yourself to your limits. Knowing you can find
            your optimal recovery window, for maximum periodization.
          </Paragraph>
          <ReachIcon />
        </View>
      </View>
      <Card
        style={styles.card}
        onPress={() => {
          PushNotification.localNotification({
            //... You can use all the options from localNotifications
            message: "My Notification Message", // (required)
            date: new Date(Date.now() + 60 * 1000) // in 60 secs
          });
        }}>
        <View style={styles.cardContent}>
          <SettingsIcon />
          <Headline style={{textAlign: 'center', fontWeight: '300'}}>
            Settings
          </Headline>
          <Paragraph style={{textAlign: 'center', ...bannerStyles.secondary}}>
            Everybody is different. Tailor the experience to your abilities.
          </Paragraph>
        </View>
      </Card>
      <ActivityTimeBar />
      <PausedPomodoro />
    </LoggedInLayout>
  );
};

export default LoggedIn;
