import { View, Text } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';

const StreakSummary = () => {
  const { currentStreak, longestStreak } = useUserStatsStore();

  return (
    <View className="flex-1 bg-m3-surface-low rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <MaterialIcons name="local-fire-department" size={22} color="#7c4100" />
        <Text className="text-[11px] leading-4 text-m3-on-surface-variant font-bold tracking-wide">
          STREAK
        </Text>
      </View>
      <View className="my-1">
        <Text className="font-heading text-[28px] leading-9 text-m3-primary font-bold tracking-tight">
          {currentStreak}
        </Text>
        <Text className="text-[12px] leading-4 text-m3-on-surface">
          Daily Streak
        </Text>
      </View>
      <View className="pt-1">
        <Text className="text-[11px] leading-4 text-m3-outline">
          Best: {longestStreak} days
        </Text>
      </View>
    </View>
  );
};

export default StreakSummary;
