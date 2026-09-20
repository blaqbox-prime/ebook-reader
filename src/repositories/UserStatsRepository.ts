import UserStats from '@/src/Models/UserStats';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { Achievement } from '@/src/types/achievement.types';

class UserStatsRepository {
  private readonly STORAGE_KEY = 'user_stats';

  /**
   * Fetches the user stats record from MMKV storage
   */
  getUserStats(): UserStats | null {
    const statsJson = preferencesStorage.getString(this.STORAGE_KEY);
    if (!statsJson) {
      return null;
    }
    try {
      const data = JSON.parse(statsJson);
      return new UserStats(
        data.totalXp,
        data.currentStreak,
        data.longestStreak,
        new Date(data.lastReadAt),
        data.totalPagesRead,
        data.totalBooksCompleted,
        data.totalReadingTime,
        data.fastestBookCompletion,
        data.achievements
      );
    } catch {
      return null;
    }
  }

  /**
   * Creates a new user stats record in MMKV storage
   */
  createUserStats(stats: Partial<UserStats>): UserStats {
    const lastReadAt = stats.lastReadAt ?? new Date(0);
    const userStats = stats as UserStats;
    userStats.lastReadAt = lastReadAt;

    preferencesStorage.set(
      this.STORAGE_KEY,
      JSON.stringify({
        ...userStats,
        lastReadAt: userStats.lastReadAt.toISOString(),
      })
    );
    return userStats;
  }

  /**
   * Updates the user stats record in MMKV storage
   */
  updateUserStats(updates: Partial<UserStats>): UserStats | null {
    const currentStats: UserStats | null = this.getUserStats();
    if (!currentStats) {
      return null;
    }

    const updatedStats = { currentStats, ...updates } as UserStats;

    preferencesStorage.set(
      this.STORAGE_KEY,
      JSON.stringify({
        totalXp: updatedStats.totalXp,
        currentStreak: updatedStats.currentStreak,
        longestStreak: updatedStats.longestStreak,
        lastReadAt: updatedStats.lastReadAt.toISOString(),
      })
    );

    return updatedStats;
  }

  /**
   * Deletes the user stats record from MMKV storage
   */
  deleteUserStats(): void {
    preferencesStorage.remove(this.STORAGE_KEY);
  }
}

export default UserStatsRepository;
