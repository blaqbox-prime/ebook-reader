import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import UserStatsRepository from '@/src/repositories/UserStatsRepository';

const KEY = 'user_stats';

describe('UserStatsRepository', () => {
  let repo: UserStatsRepository;

  beforeEach(() => {
    preferencesStorage.clearAll();
    repo = new UserStatsRepository();
  });

  describe('getUserStats', () => {
    it('returns null when nothing is stored', () => {
      expect(repo.getUserStats()).toBeNull();
    });

    it('round-trips every field through MMKV', () => {
      const lastReadAt = new Date('2026-03-04T10:00:00.000Z');
      repo.createUserStats({
        totalXp: 420,
        currentStreak: 3,
        longestStreak: 9,
        lastReadAt,
        totalPagesRead: 800,
        totalBooksCompleted: 5,
        totalReadingTime: 240,
        fastestBookCompletion: 2,
        achievements: {},
      });

      const loaded = repo.getUserStats();

      expect(loaded).not.toBeNull();
      expect(loaded!.totalXp).toBe(420);
      expect(loaded!.currentStreak).toBe(3);
      expect(loaded!.longestStreak).toBe(9);
      expect(loaded!.totalPagesRead).toBe(800);
      expect(loaded!.totalBooksCompleted).toBe(5);
      expect(loaded!.totalReadingTime).toBe(240);
      expect(loaded!.fastestBookCompletion).toBe(2);
      expect(loaded!.lastReadAt.toISOString()).toBe(lastReadAt.toISOString());
    });

    it('falls back to safe defaults for a corrupt payload instead of throwing', () => {
      preferencesStorage.set(KEY, '{ this is not json');

      expect(repo.getUserStats()).toBeNull();
    });

    it('defaults a missing achievements map to an empty object', () => {
      preferencesStorage.set(KEY, JSON.stringify({ totalXp: 10 }));

      const loaded = repo.getUserStats();

      expect(loaded!.achievements).toEqual({});
      expect(loaded!.totalXp).toBe(10);
    });

    it('preserves Infinity for an unset fastest completion', () => {
      repo.createUserStats({ totalXp: 0 });

      expect(repo.getUserStats()!.fastestBookCompletion).toBe(Infinity);
    });
  });

  describe('updateUserStats', () => {
    it('returns null when there is no record to merge into', () => {
      expect(repo.updateUserStats({ totalXp: 5 })).toBeNull();
    });

    it('merges without dropping untouched fields', () => {
      repo.createUserStats({
        totalXp: 100,
        currentStreak: 4,
        totalPagesRead: 50,
      });
      const previousLastRead = new Date('2026-01-01T00:00:00.000Z');
      repo.updateUserStats({ lastReadAt: previousLastRead });

      const updated = repo.updateUserStats({ totalXp: 150 });

      expect(updated!.totalXp).toBe(150);
      expect(updated!.currentStreak).toBe(4);
      expect(updated!.totalPagesRead).toBe(50);
      expect(updated!.lastReadAt.toISOString()).toBe(
        previousLastRead.toISOString()
      );
    });

    it('keeps the existing achievements map when not supplied', () => {
      repo.createUserStats({
        achievements: { 'first-book': { isUnlocked: true } } as never,
      });

      const updated = repo.updateUserStats({ totalXp: 5 });

      expect(updated!.achievements).toEqual({
        'first-book': { isUnlocked: true },
      });
    });
  });

  describe('deleteUserStats', () => {
    it('clears the stored record', () => {
      repo.createUserStats({ totalXp: 10 });
      expect(repo.getUserStats()).not.toBeNull();

      repo.deleteUserStats();

      expect(repo.getUserStats()).toBeNull();
    });
  });
});
