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
    const userStats: UserStats = {
      totalXp: stats.totalXp ?? 0,
      currentStreak: stats.currentStreak ?? 0,
      longestStreak: stats.longestStreak ?? 0,
      lastReadAt: stats.lastReadAt ?? new Date(0),
      totalPagesRead: stats.totalPagesRead ?? 0,
      totalBooksCompleted: stats.totalBooksCompleted ?? 0,
      totalReadingTime: stats.totalReadingTime ?? 0,
      fastestBookCompletion: stats.fastestBookCompletion ?? Infinity,
      achievements: stats.achievements ?? {},
    };

    this.persist(userStats);
    return userStats;
  }

  /**
   * Updates the user stats record in MMKV storage, merging into the current
   * record so no fields are lost.
   */
  updateUserStats(updates: Partial<UserStats>): UserStats | null {
    const currentStats = this.getUserStats();
    if (!currentStats) {
      return null;
    }

    const updatedStats: UserStats = {
      ...currentStats,
      ...updates,
      lastReadAt: updates.lastReadAt ?? currentStats.lastReadAt,
      achievements: updates.achievements ?? currentStats.achievements,
    };

    this.persist(updatedStats);
    return updatedStats;
  }

  /**
   * Deletes the user stats record from MMKV storage
   */
  deleteUserStats(): void {
    preferencesStorage.remove(this.STORAGE_KEY);
  }

  private persist(stats: UserStats): void {
    preferencesStorage.set(
      this.STORAGE_KEY,
      JSON.stringify({
        ...stats,
        lastReadAt: stats.lastReadAt.toISOString(),
      })
    );
  }
}

export default UserStatsRepository;
