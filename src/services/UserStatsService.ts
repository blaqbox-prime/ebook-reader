import { UserStatsRepository } from '@/src/repositories';
import UserStats from '@/src/Models/UserStats';

class UserStatsService {
  private userStatsRepository = new UserStatsRepository();

  // XP calculation: 1 XP per minute read
  private readonly XP_PER_MINUTE = 1;
  // Streak bonus: +0.1 XP per minute per streak day (10% bonus per day)
  private readonly STREAK_BONUS_RATE = 0.1;

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private getYesterday(date: Date): Date {
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    return yesterday;
  }

  async getUserStats(): Promise<UserStats | null> {
    return this.userStatsRepository.getUserStats();
  }

  async initializeUserStats(): Promise<UserStats> {
    const existingStats = this.userStatsRepository.getUserStats();
    if (existingStats) {
      return existingStats;
    }

    return this.userStatsRepository.createUserStats({
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadAt: new Date(0),
    });
  }

  async refreshDailyStreak(
    minutesReadToday: number,
    thresholdMinutes = 5
  ): Promise<UserStats | null> {
    const today = new Date();
    const currentStats = await this.initializeUserStats();

    if (minutesReadToday < thresholdMinutes) {
      return currentStats;
    }

    if (this.isSameDay(currentStats.lastReadAt, today)) {
      return this.userStatsRepository.updateUserStats({ lastReadAt: today });
    }

    const yesterday = this.getYesterday(today);
    const nextStreak = this.isSameDay(currentStats.lastReadAt, yesterday)
      ? currentStats.currentStreak + 1
      : 1;

    const updatedStats = this.userStatsRepository.updateUserStats({
      currentStreak: nextStreak,
      longestStreak: Math.max(currentStats.longestStreak, nextStreak),
      lastReadAt: today,
    });

    return updatedStats;
  }

  async updateCurrentStreak(currentStreak: number): Promise<UserStats | null> {
    return this.userStatsRepository.updateUserStats({ currentStreak });
  }

  async updateLongestStreak(longestStreak: number): Promise<UserStats | null> {
    return this.userStatsRepository.updateUserStats({ longestStreak });
  }

  async updateTotalXp(totalXp: number): Promise<UserStats | null> {
    return this.userStatsRepository.updateUserStats({ totalXp });
  }

  async updateLastReadAt(lastReadAt: Date): Promise<UserStats | null> {
    return this.userStatsRepository.updateUserStats({ lastReadAt });
  }

  /**
   * Adds XP points based on minutes read
   * @param minutesRead - Number of minutes read
   */
  async addXpForMinutes(minutesRead: number): Promise<UserStats | null> {
    const currentStats = await this.initializeUserStats();
    const xpEarned = Math.floor(minutesRead * this.XP_PER_MINUTE);
    const newTotalXp = currentStats.totalXp + xpEarned;

    return this.userStatsRepository.updateUserStats({ totalXp: newTotalXp });
  }

  /**
   * Gets the current total XP
   */
  async getTotalXp(): Promise<number> {
    const stats = await this.initializeUserStats();
    return stats.totalXp;
  }

  /**
   * Calculates XP for minutes read with streak bonus
   * @param minutesRead - Number of minutes read
   * @param currentStreak - Current reading streak in days
   */
  calculateXpWithStreak(minutesRead: number, currentStreak: number): number {
    const baseXp = minutesRead * this.XP_PER_MINUTE;
    const bonusMultiplier = 1 + currentStreak * this.STREAK_BONUS_RATE;
    return Math.floor(baseXp * bonusMultiplier);
  }

  /**
   * Gets the current streak
   */
  async getCurrentStreak(): Promise<number> {
    const stats = await this.initializeUserStats();
    return stats.currentStreak;
  }

  /**
   * Gets the longest streak
   */
  async getLongestStreak(): Promise<number> {
    const stats = await this.initializeUserStats();
    return stats.longestStreak;
  }
}

export default UserStatsService;
