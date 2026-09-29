import { ACHIEVEMENT_DEFINITIONS } from '@/src/lib/achievements.config';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { useAchievementStore } from '@/src/store/achievementStore';
import { makeSession } from '@/src/test/factories';

const store = () => useAchievementStore.getState();

describe('achievementStore', () => {
  beforeEach(() => {
    preferencesStorage.clearAll();
    useAchievementStore.setState({
      userStats: {
        totalXp: 0,
        lastReadAt: new Date(0),
        totalPagesRead: 0,
        totalBooksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalReadingTime: 0,
        fastestBookCompletion: Infinity,
        achievements: {},
      },
      newlyUnlockedAchievements: [],
    });
    store().resetProgress();
  });

  describe('initializeAchievements', () => {
    it('populates a locked entry for every definition', () => {
      store().initializeAchievements();

      const { achievements } = store().userStats;
      expect(Object.keys(achievements).length).toBeGreaterThan(0);
      expect(Object.values(achievements).every(a => !a.isUnlocked)).toBe(true);
    });

    it('backfills definitions absent from a saved record, keeping saved unlocks', () => {
      // Seed only one real definition as unlocked; the other 22 are missing.
      preferencesStorage.set(
        'user_stats',
        JSON.stringify({
          totalXp: 50,
          achievements: {
            first_page: {
              id: 'first_page',
              title: 'First Steps',
              category: 'pages',
              requirement: 1,
              points: 10,
              isUnlocked: true,
              unlockedAt: '2026-01-01T00:00:00.000Z',
            },
          },
        })
      );

      store().initializeAchievements();

      const { achievements } = store().userStats;
      // every definition is present
      expect(Object.keys(achievements)).toHaveLength(
        ACHIEVEMENT_DEFINITIONS.length
      );
      // the saved unlock survived
      expect(achievements.first_page.isUnlocked).toBe(true);
      expect(achievements.first_page.unlockedAt).toBe(
        '2026-01-01T00:00:00.000Z'
      );
      // the missing ones were added, locked
      expect(achievements.thousand_pages.isUnlocked).toBe(false);
    });

    it('prunes saved entries that are no longer definitions', () => {
      preferencesStorage.set(
        'user_stats',
        JSON.stringify({
          achievements: {
            retired_achievement: {
              id: 'retired_achievement',
              isUnlocked: true,
            },
          },
        })
      );

      store().initializeAchievements();

      expect(
        store().userStats.achievements.retired_achievement
      ).toBeUndefined();
    });

    it('is safe to call repeatedly', () => {
      store().initializeAchievements();
      const first = Object.keys(store().userStats.achievements).length;
      store().initializeAchievements();

      expect(Object.keys(store().userStats.achievements)).toHaveLength(first);
    });
  });

  describe('processReadingSession', () => {
    it('accumulates pages read', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 30, durationInMinutes: 5 })
      );
      await store().processReadingSession(
        makeSession({ pagesRead: 20, durationInMinutes: 5 })
      );

      expect(store().userStats.totalPagesRead).toBe(50);
    });

    it('accumulates reading time in minutes', async () => {
      await store().processReadingSession(
        makeSession({ durationInMinutes: 10 })
      );
      await store().processReadingSession(
        makeSession({ durationInMinutes: 15 })
      );

      expect(store().userStats.totalReadingTime).toBe(25);
    });

    it('treats absent pagesRead and bookCompleted as zero/false', async () => {
      await store().processReadingSession(
        makeSession({
          pagesRead: undefined,
          bookCompleted: undefined,
          durationInMinutes: 3,
        })
      );

      expect(store().userStats.totalPagesRead).toBe(0);
      expect(store().userStats.totalBooksCompleted).toBe(0);
    });

    it('awards XP through the ledger', async () => {
      await store().processReadingSession(
        makeSession({ durationInMinutes: 30 })
      );

      expect(store().userStats.totalXp).toBeGreaterThan(0);
    });

    it('persists progress to storage', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 7, durationInMinutes: 4 })
      );

      const raw = preferencesStorage.getString('user_stats');
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!).totalPagesRead).toBe(7);
    });

    it('unlocks an achievement when its threshold is crossed, and only once', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 1, durationInMinutes: 0 })
      );
      const firstUnlockBatch = store().newlyUnlockedAchievements.length;

      await store().processReadingSession(
        makeSession({ pagesRead: 1, durationInMinutes: 0 })
      );

      expect(firstUnlockBatch).toBeGreaterThan(0);
      // nothing new to unlock the second time
      expect(store().newlyUnlockedAchievements).toHaveLength(0);
    });

    it('never regresses total pages read', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 100, durationInMinutes: 10 })
      );
      const after = store().userStats.totalPagesRead;

      await store().processReadingSession(
        makeSession({ pagesRead: 0, durationInMinutes: 1 })
      );

      expect(store().userStats.totalPagesRead).toBe(after);
    });

    it('keeps the fastest known completion and ignores a null value', async () => {
      await store().processReadingSession(
        makeSession({ durationInMinutes: 1 }),
        {
          fastestCompletionDays: 3,
        }
      );
      expect(store().userStats.fastestBookCompletion).toBe(3);

      await store().processReadingSession(
        makeSession({ durationInMinutes: 1 }),
        {
          fastestCompletionDays: 9,
        }
      );
      expect(store().userStats.fastestBookCompletion).toBe(3);

      await store().processReadingSession(
        makeSession({ durationInMinutes: 1 }),
        {
          fastestCompletionDays: null,
        }
      );
      expect(store().userStats.fastestBookCompletion).toBe(3);
    });

    it('records the first completion when fastestBookCompletion is unset', async () => {
      await store().processReadingSession(
        makeSession({ durationInMinutes: 1 }),
        {
          fastestCompletionDays: 0,
        }
      );

      expect(store().userStats.fastestBookCompletion).toBe(0);
    });
  });

  describe('getTotalPoints', () => {
    it('sums points for unlocked achievements only', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 500, durationInMinutes: 60 })
      );

      const { achievements } = store().userStats;
      const expected = Object.values(achievements)
        .filter(a => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0);

      expect(store().getTotalPoints()).toBe(expected);
    });

    it('is 0 when nothing is unlocked', () => {
      store().initializeAchievements();

      expect(store().getTotalPoints()).toBe(0);
    });
  });

  describe('getAchievementsByCategory', () => {
    it('filters by category and sorts by requirement', async () => {
      store().initializeAchievements();

      const pages = store().getAchievementsByCategory('pages');
      const requirements = pages.map(a => a.requirement);

      expect(pages.every(a => a.category === 'pages')).toBe(true);
      expect([...requirements].sort((a, b) => a - b)).toEqual(requirements);
    });

    it('returns an empty list for a category with no definitions', () => {
      store().initializeAchievements();

      expect(store().getAchievementsByCategory('nonsense' as never)).toEqual(
        []
      );
    });
  });

  describe('clearNewlyUnlocked', () => {
    it('empties the unlock queue', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 400, durationInMinutes: 30 })
      );

      store().clearNewlyUnlocked();

      expect(store().newlyUnlockedAchievements).toEqual([]);
    });
  });

  describe('resetProgress', () => {
    it('clears stored stats and reinitialises', async () => {
      await store().processReadingSession(
        makeSession({ pagesRead: 100, durationInMinutes: 20 })
      );

      store().resetProgress();

      expect(store().userStats.totalPagesRead).toBe(0);
      expect(store().userStats.totalXp).toBe(0);
      expect(preferencesStorage.getString('user_stats')).not.toBeNull();
    });
  });

  // ---------------------------------------------------------------------
  // BUG-09: `totalBooksCompleted` has historically been tracked with a
  // per-mount "hasReachedFirstMilestone" latch, so re-entering a book could
  // increment the counter repeatedly for the same completion. The intended
  // behaviour is one increment per book that is actually finished.
  // ---------------------------------------------------------------------
  describe('BUG-09: book completion counting', () => {
    it.todo('a book that is completed twice only counts once');

    it.todo('re-entering an already-completed book does not re-increment');
  });
});
