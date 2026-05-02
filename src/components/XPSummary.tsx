import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { colors } from '@/src/constants';
import { useUserStatsStore } from '@/src/store/userStatsStore';

const XPSummary = () => {
  const { currentXP } = useUserStatsStore();
  return (
    <View className="bg-app-deep-mocha-800 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl col-span-2">
      {/* <SimpleLineIcons
        name="badge"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      /> */}
      <View className="flex-col items-center justify-center">
        <Text className="text-white text-5xl font-heading">{currentXP} XP</Text>
      </View>
    </View>
  );
};

export default XPSummary;
