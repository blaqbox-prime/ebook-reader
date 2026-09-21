import { Text, View } from 'react-native';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';

const getLevelFromXp = (xp: number): number =>
  Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;

const XPSummary = () => {
  const { currentXP } = useUserStatsStore();

  return (
    <View className="flex-1 bg-m3-surface-low rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <MaterialIcons name="workspace-premium" size={20} color="#6e5c39" />
        <Text className="text-[11px] leading-4 text-m3-on-surface-variant font-bold tracking-wide">
          RANK
        </Text>
      </View>
      <View className="my-1">
        <Text className="text-base leading-6 text-m3-primary font-bold tracking-tight">
          {currentXP.toLocaleString()}
        </Text>
        <Text className="text-[12px] leading-4 text-m3-outline">Total XP</Text>
      </View>
      <View className="pt-1">
        <View className="self-start bg-m3-secondary-container rounded-full px-2 py-0.5">
          <Text className="text-[11px] leading-4 text-m3-on-secondary-container font-semibold">
            Lvl {getLevelFromXp(currentXP)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default XPSummary;
