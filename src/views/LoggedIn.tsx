import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {StyleSheet, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {bannerStyles} from '../components/Banner';
import {Caption, Card, Headline, Paragraph} from 'react-native-paper';
import ReachIcon from '../images/ReachIcon';
import {GlobalState, selectSecurityState, selectUserState} from '../reducers';
import SettingsIcon from '../images/SettingsIcon';
import ActivityTimeBar from '../components/time/ActivityTimeBar';
import PausedPomodoro from '../components/time/PausedPomodoro';
import {useNavigation} from 'react-navigation-hooks';

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
          <Headline>TacMod</Headline>
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
          navigate({routeName: 'Settings'});
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
