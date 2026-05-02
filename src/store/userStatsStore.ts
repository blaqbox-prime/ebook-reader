import { create } from 'zustand';
import { watermelondb } from '@/src/data';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import UserStatsService from '@/src/services/UserStatsService';

interface UserStatsState {
  totalMinutesRead: number;
  todayMinutesRead: number;
  hasReadToday: boolean;
  currentStreak: number;
  longestStreak: number;
  currentXP: number;
  setTotalMinutesRead: (minutes: number) => void;
  setTodayMinutesRead: (minutes: number) => void;
  setHasReadToday: (value: boolean) => void;
  setCurrentStreak: (streak: number) => void;
  setLongestStreak: (streak: number) => void;
  setCurrentXP: (xp: number) => void;
  setUserStats: (stats: {
    totalMinutesRead?: number;
    todayMinutesRead?: number;
    hasReadToday?: boolean;
    currentStreak?: number;
    longestStreak?: number;
    currentXP?: number;
  }) => void;
}

export const useUserStatsStore = create<UserStatsState>((set, get) => {
  // Set up observation of reading sessions
  const sessionsCollection = watermelondb.get('reading_sessions');
  const service = new SessionTrackingService();
  const userStatsService = new UserStatsService();

  const updateStats = async () => {
    try {
      const total = await service.getTotalDurationInMinutes();
      const today = await service.getTotalDurationTodayInMinutes();
      const hasRead = await service.hasReadAtLeastToday(5); // Check if read any minutes today

      // Refresh streak based on today's reading
      await userStatsService.refreshDailyStreak(today);

      // Get updated streak for XP calculation
      const currentStreak = await userStatsService.getCurrentStreak();
      const longestStreak = await userStatsService.getLongestStreak();

      // Calculate XP with streak bonus
      const currentXP = userStatsService.calculateXpWithStreak(
        total,
        currentStreak
      );

      set({
        totalMinutesRead: total,
        todayMinutesRead: today,
        hasReadToday: hasRead,
        currentXP: currentXP,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  // Subscribe to changes in reading_sessions table
  sessionsCollection
    .query()
    .observeWithColumns(['time_start_at', 'time_end_at'])
    .subscribe(() => {
      updateStats();
    });

  return {
    totalMinutesRead: 0,
    todayMinutesRead: 0,
    hasReadToday: false,
    currentStreak: 0,
    longestStreak: 0,
    currentXP: 0,
    setTotalMinutesRead: (minutes: number) =>
      set({ totalMinutesRead: minutes }),
    setTodayMinutesRead: (minutes: number) =>
      set({ todayMinutesRead: minutes }),
    setHasReadToday: (value: boolean) => set({ hasReadToday: value }),
    setCurrentStreak: (streak: number) => set({ currentStreak: streak }),
    setLongestStreak: (streak: number) => set({ longestStreak: streak }),
    setUserStats: stats =>
      set({
        totalMinutesRead: stats.totalMinutesRead ?? 0,
        todayMinutesRead: stats.todayMinutesRead ?? 0,
        hasReadToday: stats.hasReadToday ?? false,
        currentStreak: stats.currentStreak ?? 0,
        longestStreak: stats.longestStreak ?? 0,
        currentXP: stats.currentXP ?? 0,
      }),
    setCurrentXP: (xp: number) => set({ currentXP: xp }),
  };
});
