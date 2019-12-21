import React, {FC, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {createApplicationInitializedEvent} from '../events/ApplicationLifecycleEvents';
import {createRequestLogonEvent} from '../events/SecurityEvents';
import {StyleSheet, Text, View} from 'react-native';
import {
  Button,
  Caption,
  Headline,
  Paragraph,
  Subheading,
} from 'react-native-paper';
import ReachIcon from '../images/ReachIcon';

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
    margin: 10,
    maxHeight: 400,
  },
  secondary: {
    color: 'slategrey',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e49d2c',
    color: '#585858',
    textDecorationColor: '#585858',
    paddingTop: 5,
    paddingBottom: 5,
  },
});

const LoggedOut: FC = () => {
  const dispetch = useDispatch();

  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  const login = async () => {
    dispetch(createRequestLogonEvent());
  };
  useEffect(() => {
    dispetch(createApplicationInitializedEvent());
  }, [dispetch]);

  return (
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
        <Button color={'#585858'} style={styles.button} onPress={login}>
          Start Using SOGoS!
        </Button>
      </View>
    </View>
  );
};

export default LoggedOut;
