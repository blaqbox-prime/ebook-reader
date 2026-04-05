import { View, Text } from 'react-native';
import React from 'react';
import { colors } from '@/src/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const StreakSummary = () => {
  return (
    <View className="bg-app-deep-mocha-300 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <MaterialIcons
        name="local-fire-department"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      />
      <Text className="text-white text-5xl font-heading">2</Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Daily Streak
      </Text>
    </View>
  );
};

export default StreakSummary;
