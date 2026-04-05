class UserStats {
  totalXp: number = 0;
  currentStreak: number = 0;
  longestStreak: number = 0;
  lastReadAt: Date = new Date();

  constructor(
    xp: number,
    currentStreak: number,
    longestStreak: number,
    lastReadAt: Date
  ) {
    this.totalXp = xp;
    this.currentStreak = currentStreak;
    this.longestStreak = longestStreak;
    this.lastReadAt = lastReadAt;
  }
}

export default UserStats;
