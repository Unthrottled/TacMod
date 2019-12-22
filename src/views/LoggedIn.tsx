import React, {FC, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {requestLogoff} from '../events/SecurityEvents';
import {StyleSheet, Text, View} from 'react-native';
import LoggedInLayout from '../components/LoggedInLayout';
import {bannerStyles} from '../components/Banner';
import {Button, Caption, Headline, Paragraph, Title} from 'react-native-paper';
import ReachIcon from '../images/ReachIcon';
import {GlobalState, selectUserState} from '../reducers';

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
});

const LoggedIn: FC = () => {
  const dispetch = useDispatch();
  const {fullName, guid} = useSelector(mapStateToProps);

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const logout = async () => {
    try {
      dispetch(requestLogoff());
    } catch (e) {
      console.warn('Shit broke yo', e.message);
    }
  };

  return (
    <LoggedInLayout>
      <View
        style={{
          ...bannerStyles.banner,
          ...styles.banner,
        }}>
        <View style={{
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
      <Text>You are logged in, Hurray!!</Text>
      <Button mode={'contained'} onPress={logout}>
        LOGOUT
      </Button>
    </LoggedInLayout>
  );
};

export default LoggedIn;
