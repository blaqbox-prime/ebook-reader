import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import UserStatsRepository from '@/src/repositories/UserStatsRepository';
import UserStatsService from '@/src/services/UserStatsService';
import { daysAgo } from '@/src/test/factories';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let repo: UserStatsRepository;

  beforeEach(() => {
    preferencesStorage.clearAll();
    service = new UserStatsService();
    repo = new UserStatsRepository();
  });

  describe('calculateXpWithStreak', () => {
    it('awards 1 XP per minute with no streak', () => {
      expect(service.calculateXpWithStreak(30, 0)).toBe(30);
    });

    it('adds 10% of the base per streak day', () => {
      // 10 * 1.2 = 12
      expect(service.calculateXpWithStreak(10, 2)).toBe(12);
    });

    it('floors rather than rounding to keep XP monotonic', () => {
      // 5 * 1.1 = 5.5 -> 5
      expect(service.calculateXpWithStreak(5, 1)).toBe(5);
    });
  });

  describe('addXpForMinutes', () => {
    it('accrues XP as a growing ledger', async () => {
      await service.addXpForMinutes(10, 0);
      await service.addXpForMinutes(10, 0);

      expect(await service.getTotalXp()).toBe(20);
    });

    it('never reduces XP when the streak is later lost', async () => {
      await service.addXpForMinutes(60, 5);

      const before = await service.getTotalXp();
      await service.refreshDailyStreak(0, 25); // below threshold -> decays
      const after = await service.getTotalXp();

      expect(before).toBe(90); // 60 * 1.5
      expect(after).toBe(before);
    });

    it('ignores a zero or negative duration', async () => {
      await service.addXpForMinutes(0, 3);
      await service.addXpForMinutes(-10, 3);

      expect(await service.getTotalXp()).toBe(0);
    });
  });

  describe('refreshDailyStreak', () => {
    it('starts a streak when the goal is met and no history exists', async () => {
      const stats = await service.refreshDailyStreak(30, 25);

      expect(stats!.currentStreak).toBe(1);
      expect(stats!.longestStreak).toBe(1);
    });

    it('does not advance the streak when the daily goal is not met', async () => {
      await service.refreshDailyStreak(30, 25);

      const stats = await service.refreshDailyStreak(10, 25);

      expect(stats!.currentStreak).toBe(1);
    });

    it('treats reading yesterday then today as a continuing streak', async () => {
      repo.createUserStats({
        currentStreak: 4,
        longestStreak: 4,
        lastReadAt: daysAgo(1),
      });

      const stats = await service.refreshDailyStreak(30, 25);

      expect(stats!.currentStreak).toBe(5);
      expect(stats!.longestStreak).toBe(5);
    });

    it('resets to 1 after a two-day gap', async () => {
      repo.createUserStats({
        currentStreak: 4,
        longestStreak: 4,
        lastReadAt: daysAgo(3),
      });

      const stats = await service.refreshDailyStreak(30, 25);

      expect(stats!.currentStreak).toBe(1);
      // longestStreak must never regress
      expect(stats!.longestStreak).toBe(4);
    });

    it('is idempotent within a single day', async () => {
      await service.refreshDailyStreak(30, 25);
      await service.refreshDailyStreak(45, 25);
      await service.refreshDailyStreak(60, 25);

      expect(await service.getCurrentStreak()).toBe(1);
    });

    it('decays a lapsed streak to 0 when the goal is not met', async () => {
      repo.createUserStats({
        currentStreak: 7,
        longestStreak: 7,
        lastReadAt: daysAgo(3),
      });

      const stats = await service.refreshDailyStreak(0, 25);

      expect(stats!.currentStreak).toBe(0);
    });

    it('returns the decayed snapshot, not the pre-decay one', async () => {
      repo.createUserStats({
        currentStreak: 7,
        longestStreak: 7,
        lastReadAt: daysAgo(3),
      });

      const stats = await service.refreshDailyStreak(0, 25);

      expect(stats!.currentStreak).toBe(0);
    });

    it('honours the caller-supplied goal instead of a hardcoded default', async () => {
      // 5 minutes would fail a hardcoded 5-minute-or-more gate check at 4.
      const stats = await service.refreshDailyStreak(4, 5);
      expect(stats!.currentStreak).toBe(0);

      const met = await service.refreshDailyStreak(5, 5);
      expect(met!.currentStreak).toBe(1);
    });
  });

  describe('ensureXpLedgerInitialized', () => {
    it('back-fills XP once for pre-ledger installs', async () => {
      const seeded = await service.ensureXpLedgerInitialized(100, 2);

      expect(seeded).toBe(true);
      expect(await service.getTotalXp()).toBe(120); // 100 * 1.2
    });

    it('is idempotent and never double-counts', async () => {
      await service.ensureXpLedgerInitialized(100, 2);

      expect(await service.ensureXpLedgerInitialized(100, 2)).toBe(false);
      expect(await service.ensureXpLedgerInitialized(500, 2)).toBe(false);
      expect(await service.getTotalXp()).toBe(120);
    });

    it('does nothing when there is no reading history', async () => {
      expect(await service.ensureXpLedgerInitialized(0, 0)).toBe(false);
      expect(await service.getTotalXp()).toBe(0);
    });

    it('never clobbers XP that was already earned', async () => {
      await service.addXpForMinutes(30, 0);

      expect(await service.ensureXpLedgerInitialized(9999, 0)).toBe(false);
      expect(await service.getTotalXp()).toBe(30);
    });
  });

  describe('initializeUserStats', () => {
    it('creates a record on first call and reuses it afterwards', async () => {
      const first = await service.initializeUserStats();
      const second = await service.initializeUserStats();

      expect(first.totalXp).toBe(0);
      expect(second.totalXp).toBe(0);
      expect(repo.getUserStats()).not.toBeNull();
    });
  });
});
