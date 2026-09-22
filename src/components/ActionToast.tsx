import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

export type ToastIconName = ComponentProps<typeof MaterialIcons>['name'];

const ActionToast = ({
  message,
  icon,
  visible,
}: {
  message: string | null;
  icon?: ToastIconName;
  visible: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 48,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{ opacity, transform: [{ translateY }] }}
      className="absolute left-6 right-6 bottom-24 z-50 items-center"
    >
      <View className="flex-row items-center gap-2 bg-m3-inverse-surface rounded-full px-4 py-2.5 shadow-lg">
        {icon ? <MaterialIcons name={icon} size={18} color="#f2f0ed" /> : null}
        <Text className="text-[12px] leading-4 text-m3-inverse-on-surface font-semibold">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default ActionToast;
