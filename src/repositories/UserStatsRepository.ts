import { Database } from '@nozbe/watermelondb';
import { UserStats } from '@/src/data/watermelondb/models';

class UserStatsRepository {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Returns the collection for the UserStats model
   */
  get userStatsCollection() {
    return this.database.get<UserStats>('user_stats');
  }

  /**
   * Fetches the user stats record (assuming single record)
   */
  async getUserStats(): Promise<UserStats | null> {
    const stats = await this.userStatsCollection.query().fetch();
    return stats.length > 0 ? stats[0] : null;
  }

  /**
   * Creates a new user stats record
   */
  async createUserStats(stats: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    lastReadAt: string;
  }): Promise<UserStats> {
    return await this.database.write(async () => {
      return await this.userStatsCollection.create(userStats => {
        userStats.totalXp = stats.totalXp;
        userStats.currentStreak = stats.currentStreak;
        userStats.longestStreak = stats.longestStreak;
        userStats.lastReadAt = stats.lastReadAt;
      });
    });
  }

  /**
   * Updates the user stats record
   */
  async updateUserStats(
    statsId: string,
    updates: Partial<{
      totalXp: number;
      currentStreak: number;
      longestStreak: number;
      lastReadAt: string;
    }>
  ): Promise<void> {
    await this.database.write(async () => {
      const userStats = await this.userStatsCollection.find(statsId);
      await userStats.update(userStats => {
        if (updates.totalXp !== undefined) userStats.totalXp = updates.totalXp;
        if (updates.currentStreak !== undefined)
          userStats.currentStreak = updates.currentStreak;
        if (updates.longestStreak !== undefined)
          userStats.longestStreak = updates.longestStreak;
        if (updates.lastReadAt !== undefined)
          userStats.lastReadAt = updates.lastReadAt;
      });
    });
  }

  /**
   * Deletes the user stats record
   */
  async deleteUserStats(statsId: string): Promise<void> {
    await this.database.write(async () => {
      const userStats = await this.userStatsCollection.find(statsId);
      await userStats.markAsDeleted();
      await userStats.destroyPermanently();
    });
  }
}

export default UserStatsRepository;
