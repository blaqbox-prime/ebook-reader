import { Achievement } from '@/src/types/achievement.types';

class UserStats {
  totalXp: number = 0;
  currentStreak: number = 0;
  longestStreak: number = 0;
  lastReadAt: Date = new Date();
  totalPagesRead: number = 0;
  totalBooksCompleted: number = 0;
  totalReadingTime: number = 0; // in minutes
  fastestBookCompletion: number = Infinity; // in days
  achievements: Record<string, Achievement> = {};

  constructor(
    xp: number,
    currentStreak: number,
    longestStreak: number,
    lastReadAt: Date,
    totalPagesRead: number,
    totalBooksCompleted: number,
    totalReadingTime: number,
    fastestBookCompletion: number,
    achievements: Record<string, Achievement>
  ) {
    this.totalXp = xp;
    this.currentStreak = currentStreak;
    this.longestStreak = longestStreak;
    this.lastReadAt = lastReadAt;
    this.totalPagesRead = totalPagesRead;
    this.totalBooksCompleted = totalBooksCompleted;
    this.totalReadingTime = totalReadingTime;
    this.fastestBookCompletion = fastestBookCompletion;
    this.achievements = achievements;
  }
}

export default UserStats;
