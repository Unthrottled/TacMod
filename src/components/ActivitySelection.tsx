import {TacticalActivity} from '../types/TacticalTypes';
import {GlobalState, selectTacticalActivityState} from '../reducers';
import {useSelector} from 'react-redux';
import {FAB, Portal, Text} from 'react-native-paper';
import {
  StyleSheet,
  View,
  Animated,
  SafeAreaView,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {theme} from '../App';
import {numberObjectToArray} from '../miscellanous/Tools';
import ActivityIcon from '../images/ActivityIcon';

const mapStateToProps = (state: GlobalState) => {
  const {activities} = selectTacticalActivityState(state);
  return {
    activities,
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onActivitySelection: (arg1: TacticalActivity) => void;
  onGenericActivitySelection: () => void;
  genericIcon: JSX.Element;
};
const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'center',
  },
  activityIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  fab: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  item: {
    marginRight: 10,
    marginBottom: 16,
  },
});

const ActivitySelection = (props: Props) => {
  const {activities} = useSelector(mapStateToProps);
  const [backdrop] = useState<Animated.Value>(new Animated.Value(0));

  const {open} = props;

  const activityArray = numberObjectToArray(activities);

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [backdrop, open]);

  const backdropOpacity = open
    ? backdrop.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      })
    : backdrop;

  return (
    <Portal>
      <View pointerEvents="box-none" style={styles.container}>
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor: theme.colors.backdrop,
            },
          ]}
        />
        {open && (
          <SafeAreaView pointerEvents={'box-none'} style={styles.safeArea}>
            <ScrollView pointerEvents={'box-none'} style={styles.activityIcons}>
              {activityArray.map((activity, i) => {
                return (
                  <ActivityIcon
                    key={activity.id}
                    activity={activity}
                    style={[styles.item] as StyleProp<ViewStyle>}
                    onPress={() => {
                      props.onActivitySelection(activity);
                    }}
                    accessibilityTraits="button"
                    accessibilityComponentType="button"
                    accessibilityRole="button"
                  />
                );
              })}
            </ScrollView>
          </SafeAreaView>
        )}
      </View>
    </Portal>
  );
};

export default ActivitySelection;
