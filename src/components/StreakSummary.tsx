import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { colors } from '@/src/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';

const StreakSummary = () => {
  const { currentStreak } = useUserStatsStore();

  return (
    <View className="bg-app-deep-mocha-300 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <TouchableOpacity className="absolute -top-5 -right-5 opacity-25">
        <MaterialIcons
          name="local-fire-department"
          size={80}
          color={colors['khaki-beige'][800]}
        />
      </TouchableOpacity>
      <Text className="text-white text-5xl font-heading">{currentStreak}</Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Daily Streak
      </Text>
    </View>
  );
};

export default StreakSummary;
