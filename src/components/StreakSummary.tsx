import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';

const StreakSummary = () => {
  const { currentStreak } = useUserStatsStore();

  return (
    <View className="shadow-md bg-app-taupe-grey-50 shadow-app-taupe-grey-300 h-36 flex-1 overflow-hidden relative justify-center rounded-2xl mb-4 p-8">
      <View className="absolute top-7 right-8 ">
        <MaterialIcons
          name="local-fire-department"
          size={90}
          color={`rgba(255, 69, 0, ${Math.min(1, 0.2 + currentStreak * 0.1)})`}
        />
      </View>
      <Text className="text-app-deep-mocha-950 text-5xl font-heading">
        {currentStreak}
      </Text>
      <Text className="text-app-deep-mocha-950 font-heading text-3xl">
        Daily Streak
      </Text>
    </View>
  );
};

export default StreakSummary;
