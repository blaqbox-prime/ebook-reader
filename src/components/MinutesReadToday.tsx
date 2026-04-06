import { Text, TouchableOpacity } from 'react-native';
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
  }, []);

  return (
    <TouchableOpacity className="bg-app-deep-mocha-600 h-full flex-1 overflow-hidden relative items-center justify-center rounded-2xl">
      <Feather
        name="clock"
        size={80}
        color={colors['khaki-beige'][800]}
        className="absolute -top-5 -right-5 opacity-25"
      />
      <Text className="text-white text-5xl font-heading">
        {todayMinutesRead.toFixed(0)}
      </Text>
      <Text className="text-app-khaki-beige-100 font-heading">
        Minutes Read Today
      </Text>
      <Text className="text-app-khaki-beige-100 font-heading mt-2">
        {hasReadToday ? 'Goal reached today' : 'Read 5+ minutes today'}
      </Text>
    </TouchableOpacity>
  );
};

export default MinutesReadToday;
