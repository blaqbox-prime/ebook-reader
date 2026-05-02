import { Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '@/src/constants';
import { useUserStatsStore } from '@/src/store/userStatsStore';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import UserStatsService from '@/src/services/UserStatsService';

const MinutesReadToday = () => {
  const {
    todayMinutesRead,
    hasReadToday,
    setTodayMinutesRead,
    setHasReadToday,
    setCurrentStreak,
    setLongestStreak,
  } = useUserStatsStore();

  const fetchDailyRead = async () => {
    const sessionService = new SessionTrackingService();
    const statsService = new UserStatsService();

    const todayMinutes = await sessionService.getTotalDurationTodayInMinutes();
    const readGoalMet = todayMinutes >= 5;

    setTodayMinutesRead(todayMinutes);
    setHasReadToday(readGoalMet);

    const updatedStats = await statsService.refreshDailyStreak(todayMinutes, 5);
    if (updatedStats) {
      setCurrentStreak(updatedStats.currentStreak);
      setLongestStreak(updatedStats.longestStreak);
    }
  };

  useEffect(() => {
    fetchDailyRead();
  });

  return (
    <TouchableOpacity className="bg-app-golden-apricot-100 h-full flex-1 flex-row overflow-hidden relative items-center justify-between p-4 rounded-2xl w-3/5">
      <View>
        <Text className="text-app-khaki-beige-900 text-5xl font-heading">
          {todayMinutesRead.toFixed(0)}
        </Text>
        <Text className="text-app-khaki-beige-900 font-lato-bold text-sm opacity-50">
          {hasReadToday
            ? 'Goal reached for today 🏆'
            : `${Math.max(0, 5 - todayMinutesRead).toFixed(0)} Min To Your Daily Goal`}
        </Text>
      </View>

      <Feather
        name="clock"
        size={30}
        color={colors['khaki-beige'][800]}
        className="mr-3"
      />
    </TouchableOpacity>
  );
};

export default MinutesReadToday;
