import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {StyleSheet, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {bannerStyles} from '../components/Banner';
import {Caption, Card, Headline, Paragraph} from 'react-native-paper';
import ReachIcon from '../images/ReachIcon';
import {GlobalState, selectUserState} from '../reducers';
import Icon from 'react-native-vector-icons/FontAwesome';

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
    maxHeight: 250,
    marginTop: 30,
    marginBottom: 0,
  },
  card: {
    margin: 15,
    borderRadius: 10,
  },
  cardContent: {
    marginRight: 'auto',
    maxWidth: 150,
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
            paddingTop: 10,
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
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Icon name={'gear'} size={100} style={{textAlign: 'center'}} />
          <Headline style={{textAlign: 'center', fontWeight: 'bold'}}>
            Settings
          </Headline>
          <Paragraph style={{textAlign: 'center'}}>
            Everybody is different. Tailor the experience to your abilities.
          </Paragraph>
        </View>
      </Card>
    </LoggedInLayout>
  );
};

export default LoggedIn;
