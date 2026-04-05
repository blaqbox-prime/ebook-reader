import UserStats from '@/src/Models/UserStats';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';

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
        new Date(data.lastReadAt)
      );
    } catch {
      return null;
    }
  }

  /**
   * Creates a new user stats record in MMKV storage
   */
  createUserStats(stats: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    lastReadAt: Date;
  }): UserStats {
    const userStats = new UserStats(
      stats.totalXp,
      stats.currentStreak,
      stats.longestStreak,
      stats.lastReadAt
    );
    preferencesStorage.set(
      this.STORAGE_KEY,
      JSON.stringify({
        totalXp: userStats.totalXp,
        currentStreak: userStats.currentStreak,
        longestStreak: userStats.longestStreak,
        lastReadAt: userStats.lastReadAt.toISOString(),
      })
    );
    return userStats;
  }

  /**
   * Updates the user stats record in MMKV storage
   */
  updateUserStats(
    updates: Partial<{
      totalXp: number;
      currentStreak: number;
      longestStreak: number;
      lastReadAt: Date;
    }>
  ): UserStats | null {
    const currentStats = this.getUserStats();
    if (!currentStats) {
      return null;
    }

    const updatedStats = new UserStats(
      updates.totalXp ?? currentStats.totalXp,
      updates.currentStreak ?? currentStats.currentStreak,
      updates.longestStreak ?? currentStats.longestStreak,
      updates.lastReadAt ?? currentStats.lastReadAt
    );

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
