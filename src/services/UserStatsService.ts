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

  /**
   * Recomputes the daily streak.
   *
   * `thresholdMinutes` is intentionally required: it is the user's configured
   * daily goal, and defaulting it here previously reintroduced a hardcoded
   * 5-minute gate that silently overrode the saved preference.
   */
  async refreshDailyStreak(
    minutesReadToday: number,
    thresholdMinutes: number
  ): Promise<UserStats | null> {
    const today = new Date();
    let currentStats = await this.initializeUserStats();

    // A streak is only alive if it was touched today or yesterday. Decay first
    // so a lapsed streak never renders as still active.
    const yesterday = this.getYesterday(today);
    const streakIsAlive = this.isSameDay(currentStats.lastReadAt, today)
      ? true
      : this.isSameDay(currentStats.lastReadAt, yesterday);

    if (!streakIsAlive && currentStats.currentStreak > 0) {
      // Re-read after resetting: returning the pre-decay snapshot would hand
      // callers a non-zero streak and silently revive a lapsed one.
      currentStats = (await this.userStatsRepository.updateUserStats({
        currentStreak: 0,
      })) ?? { ...currentStats, currentStreak: 0 };
    }

    if (minutesReadToday < thresholdMinutes) {
      return currentStats;
    }

    if (this.isSameDay(currentStats.lastReadAt, today)) {
      return this.userStatsRepository.updateUserStats({ lastReadAt: today });
    }

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
   * Accrues XP for a reading session.
   *
   * XP is a ledger, not a derived total: the streak bonus is frozen at award
   * time so that losing a streak can never retroactively reduce XP already
   * earned. Total XP therefore only ever increases.
   *
   * @param minutesRead - Minutes read in the session being closed
   * @param streakAtAward - Streak length at the moment of the award
   */
  async addXpForMinutes(
    minutesRead: number,
    streakAtAward: number
  ): Promise<UserStats | null> {
    const currentStats = await this.initializeUserStats();
    if (minutesRead <= 0) {
      return currentStats;
    }

    const xpEarned = this.calculateXpWithStreak(minutesRead, streakAtAward);
    if (xpEarned <= 0) {
      return currentStats;
    }

    return this.userStatsRepository.updateUserStats({
      totalXp: currentStats.totalXp + xpEarned,
    });
  }

  /**
   * Defensive one-time seed for installs created before XP became a ledger.
   *
   * Those installs persisted `totalXp: 0` forever, so the first time this runs
   * we back-fill from the historical minutes using the same curve the app used
   * to display. The guard makes it idempotent: it only writes when XP is
   * genuinely zero and there is reading history to convert, so re-running on
   * every boot can never double-count or clobber earned XP.
   *
   * @returns true when a seed was written
   */
  async ensureXpLedgerInitialized(
    totalMinutesRead: number,
    longestStreak: number
  ): Promise<boolean> {
    const stats = await this.initializeUserStats();

    if (stats.totalXp > 0 || totalMinutesRead <= 0) {
      return false;
    }

    await this.userStatsRepository.updateUserStats({
      totalXp: this.calculateXpWithStreak(totalMinutesRead, longestStreak),
    });
    return true;
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
