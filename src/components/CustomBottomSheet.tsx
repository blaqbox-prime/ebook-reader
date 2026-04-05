import React, { useCallback, useImperativeHandle } from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Define the methods we want to expose to the parent
export interface BottomSheetMethods {
  scrollTo: (destination: number) => void;
}

// 2. Define component props
interface BottomSheetProps {
  children?: React.ReactNode;
  backgroundColor?: string;
}

const CustomBottomSheet = React.forwardRef<
  BottomSheetMethods,
  BottomSheetProps
>(({ children, backgroundColor = '#ffffff' }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const context = useSharedValue({ y: 0 });

  const scrollTo = useCallback(
    (destination: number) => {
      'worklet';
      active.value = destination !== 0;
      translateY.value = withSpring(destination, {
        damping: 20,
        stiffness: 90,
      });
    },
    [active, translateY]
  );

  // Expose the scrollTo method to the parent via the ref
  useImperativeHandle(ref, () => ({ scrollTo }), [scrollTo]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate(event => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, -SCREEN_HEIGHT + 50);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        scrollTo(0);
      } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
        scrollTo(-SCREEN_HEIGHT + 50);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT + 50, -SCREEN_HEIGHT + 100],
      [5, 25],
      Extrapolation.CLAMP
    );

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [0, -SCREEN_HEIGHT / 2],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.backdrop, rBackdropStyle]}
        onTouchStart={() => scrollTo(0)}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.sheetContainer,
            { backgroundColor },
            rBottomSheetStyle,
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    zIndex: 100,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 99,
  },
  handle: {
    width: 45,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

CustomBottomSheet.displayName = 'CustomBottomSheet';

export default CustomBottomSheet;
