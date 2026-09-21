import { Text, View } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUserStatsStore } from '@/src/store/userStatsStore';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import UserStatsService from '@/src/services/UserStatsService';

const DAILY_GOAL_MINUTES = 5;

const MinutesReadToday = () => {
  const {
    todayMinutesRead,
    hasReadToday,
    setTodayMinutesRead,
    setHasReadToday,
    setCurrentStreak,
    setLongestStreak,
  } = useUserStatsStore();

  const fetchDailyRead = useCallback(async () => {
    const sessionService = new SessionTrackingService();
    const statsService = new UserStatsService();

    const todayMinutes = await sessionService.getTotalDurationTodayInMinutes();
    const readGoalMet = todayMinutes >= DAILY_GOAL_MINUTES;

    setTodayMinutesRead(todayMinutes);
    setHasReadToday(readGoalMet);

    const updatedStats = await statsService.refreshDailyStreak(
      todayMinutes,
      DAILY_GOAL_MINUTES
    );
    if (updatedStats) {
      setCurrentStreak(updatedStats.currentStreak);
      setLongestStreak(updatedStats.longestStreak);
    }
  }, [
    setTodayMinutesRead,
    setHasReadToday,
    setCurrentStreak,
    setLongestStreak,
  ]);

  useEffect(() => {
    fetchDailyRead();
  }, [fetchDailyRead]);

  const goalProgress = Math.min(
    100,
    (todayMinutesRead / DAILY_GOAL_MINUTES) * 100
  );

  return (
    <View className="flex-1 bg-m3-surface-low rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <MaterialIcons name="schedule" size={20} color="#5c2d00" />
        <Text className="text-[11px] leading-4 text-m3-on-surface-variant font-bold tracking-wide">
          GOAL
        </Text>
      </View>
      <View className="my-1">
        <View className="flex-row items-baseline">
          <Text className="text-base leading-6 text-m3-on-surface font-bold">
            {todayMinutesRead.toFixed(0)}
          </Text>
          <Text className="text-[12px] leading-4 text-m3-outline ml-0.5">
            /{DAILY_GOAL_MINUTES}m
          </Text>
        </View>
        <View className="w-full bg-m3-secondary-container h-1.5 rounded-full mt-1.5 overflow-hidden">
          <View
            className="bg-m3-primary h-full rounded-full"
            style={{ width: `${goalProgress}%` }}
          />
        </View>
      </View>
      <View className="pt-1">
        <Text className="text-[11px] leading-4 text-m3-outline">
          {hasReadToday
            ? 'Goal reached for today 🏆'
            : `${Math.max(0, DAILY_GOAL_MINUTES - todayMinutesRead).toFixed(0)}m to daily goal`}
        </Text>
      </View>
    </View>
  );
};

export default MinutesReadToday;
