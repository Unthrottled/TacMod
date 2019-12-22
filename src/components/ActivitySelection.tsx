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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {theme} from '../App';
import {numberObjectToArray} from '../miscellanous/Tools';

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
    alignItems: 'flex-end',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
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
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const ActivitySelection = (props: Props) => {
  const {activities} = useSelector(mapStateToProps);
  const [backdrop, setBackdrop] = useState<Animated.Value>(
    new Animated.Value(0),
  );
  const [activityOpacities, setActivityOpacities] = useState<Animated.Value[]>(
    [],
  );

  const {open} = props;

  useEffect(() => {
    setActivityOpacities(
      numberObjectToArray(activities).map(
        () => new Animated.Value(open ? 1 : 0),
      ),
    );
  }, [open, activities]);

  console.warn(JSON.stringify(activities));
  const activityArray = numberObjectToArray(activities);

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.stagger(
          50,
          activityOpacities
            .map(animation =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
            )
            .reverse(),
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...activityOpacities.map(animation =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ),
      ]).start();
    }
  }, [activityOpacities, backdrop, open]);

  const backdropOpacity = open
    ? backdrop.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      })
    : backdrop;

  console.warn(JSON.stringify(activityArray));
  const scales = activityOpacities.map(opacity =>
    open
      ? opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        })
      : 1,
  );
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
        <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
          <View pointerEvents={open ? 'box-none' : 'none'}>
            {activityArray.map((activity, i) => (
              <FAB
                small
                icon={'plus'}
                style={
                  [
                    {
                      transform: [{scale: scales[i]}],
                      opacity: activityOpacities[i],
                      backgroundColor: theme.colors.surface,
                    },
                  ] as StyleProp<ViewStyle>
                }
                onPress={() => {
                  props.onActivitySelection(activity);
                }}
                accessibilityTraits="button"
                accessibilityComponentType="button"
                accessibilityRole="button"
              />
            ))}
          </View>
        </SafeAreaView>
      </View>
    </Portal>
  );
};

export default ActivitySelection;
