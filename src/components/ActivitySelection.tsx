import {TacticalActivity} from '../types/TacticalTypes';
import {GlobalState, selectTacticalActivityState} from '../reducers';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar, FAB, Headline, Portal} from 'react-native-paper';
import {
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {numberObjectToArray} from '../miscellanous/Tools';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {OpenedSelection} from './time/ActivityHub';
import OtherIcon from 'react-native-vector-icons/Fontisto';
import ActivityIcon from '../images/ActivityIcon';
import {createViewedTacticalActivitesEvent} from '../events/TacticalEvents';

const generic69 = 'GENERIC69';
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
  genericIcon: OpenedSelection;
};
const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'center',
  },
  activityIcons: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 100,
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
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 16,
  },
});

const ActivitySelection = (props: Props) => {
  const {activities} = useSelector(mapStateToProps);
  const [backdrop] = useState<Animated.Value>(new Animated.Value(0));

  const {open} = props;

  const activityArray = numberObjectToArray(activities);
  const fullArray = [...activityArray];
  useEffect(() => {
    fullArray.push({
      categories: [],
      iconCustomization: {
        background: {opacity: 0, hex: ''},
        line: {opacity: 0, hex: ''},
      },
      name: 'GENERIC',
      rank: 9001,
      id: generic69,
    });
  }, [activityArray, fullArray]);

  const dispetch = useDispatch();
  useEffect(() => {
    if (open) {
      dispetch(createViewedTacticalActivitesEvent());
    }
  }, [dispetch, open]);

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
              backgroundColor: 'rgba(0,0,0,0.90)',
            },
          ]}
        />
        {open && (
          <SafeAreaView pointerEvents={'box-none'} style={styles.safeArea}>
            <FAB
              color={'black'}
              icon={'close'}
              style={{marginTop: 100, backgroundColor: 'red'}}
              onPress={props.onClose}
            />
            <FlatList
              style={styles.activityIcons}
              numColumns={2}
              data={fullArray}
              renderItem={({item: activity}) => (
                <View style={styles.item}>
                  <View style={{alignItems: 'center'}}>
                    <Headline
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{
                        color: 'white',
                        textAlign: 'left',
                        maxWidth: 130,
                      }}>
                      {activity.name}
                    </Headline>
                    <Icon name={'chevron-down'} color={'white'} />
                  </View>
                  {activity.id === generic69 ? (
                    props.genericIcon === OpenedSelection.POMODORO ? (
                      <TouchableOpacity
                        onPress={props.onGenericActivitySelection}>
                        <Avatar.Image
                          size={125}
                          style={{
                            backgroundColor: 'rgba(0,0,0,0)',
                          }}
                          source={require('../images/Tomato_big.png')}
                        />
                      </TouchableOpacity>
                    ) : (
                      <OtherIcon
                        size={125}
                        color={'white'}
                        name={'stopwatch'}
                        onPress={props.onGenericActivitySelection}
                      />
                    )
                  ) : (
                    <ActivityIcon
                      activity={activity}
                      key={activity.id}
                      onPress={() => {
                        props.onActivitySelection(activity);
                      }}
                      accessibilityTraits="button"
                      accessibilityComponentType="button"
                      accessibilityRole="button"
                    />
                  )}
                </View>
              )}
              keyExtractor={a => a.id}
            />
          </SafeAreaView>
        )}
      </View>
    </Portal>
  );
};

export default ActivitySelection;
