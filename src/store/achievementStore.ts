// stores/achievementStore.ts
import { create } from 'zustand';
import UserStats from '@/src/Models/UserStats';
import { Achievement } from '@/src/types/achievement.types';
import ReadingSession from '@/src/Models/ReadingSession';
import { ACHIEVEMENT_DEFINITIONS } from '@/src/lib/achievements.config';
import UserStatsRepository from '@/src/repositories/UserStatsRepository';
import UserStatsService from '@/src/services/UserStatsService';
import { usePreferencesStore } from '@/src/store/preferencesStore';

const userStatsRepository = new UserStatsRepository();
const userStatsService = new UserStatsService();

interface AchievementStore {
  userStats: UserStats;
  newlyUnlockedAchievements: Achievement[];

  // Actions
  initializeAchievements: () => void;
  processReadingSession: (
    session: ReadingSession,
    context?: {
      minutesReadToday?: number;
      fastestCompletionDays?: number | null;
    }
  ) => Promise<void>;
  clearNewlyUnlocked: () => void;
  getTotalPoints: () => number;
  getAchievementsByCategory: (
    category: Achievement['category']
  ) => Achievement[];
  resetProgress: () => void;
}

const initialStats: UserStats = {
  totalXp: 0,
  lastReadAt: new Date(0),
  totalPagesRead: 0,
  totalBooksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalReadingTime: 0,
  fastestBookCompletion: Infinity,
  achievements: {},
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  userStats: initialStats,
  newlyUnlockedAchievements: [],

  initializeAchievements: () => {
    // Load saved progress from storage
    const savedProgress = userStatsRepository.getUserStats();

    if (savedProgress) {
      // Backfill any achievement definitions absent from the saved record so
      // the engine keeps working regardless of which system wrote first
      const savedAchievements = savedProgress.achievements ?? {};
      const achievements: Record<string, Achievement> = {};
      ACHIEVEMENT_DEFINITIONS.forEach(def => {
        achievements[def.id] = savedAchievements[def.id] ?? {
          ...def,
          isUnlocked: false,
        };
      });

      set({ userStats: { ...savedProgress, achievements } });
    } else {
      // Initialize all achievements as locked
      const achievements: Record<string, Achievement> = {};
      ACHIEVEMENT_DEFINITIONS.forEach(def => {
        achievements[def.id] = {
          ...def,
          isUnlocked: false,
        };
      });

      const progress: UserStats = {
        ...initialStats,
        achievements,
      };

      userStatsRepository.createUserStats(progress);
      set({ userStats: progress });
    }
  },

  processReadingSession: async (
    session: ReadingSession,
    context?: {
      minutesReadToday?: number;
      fastestCompletionDays?: number | null;
    }
  ) => {
    // The unlock sweep iterates `achievements`, so the map must be populated
    // first. Previously only the Profile screen called this, which meant a user
    // who opened a book before ever visiting Profile had an empty map and could
    // never unlock anything.
    get().initializeAchievements();

    const { userStats: userProgress } = get();
    const newlyUnlocked: Achievement[] = [];

    // Make sure a persisted record exists: `updateUserStats` is a no-op that
    // returns null when there is nothing to merge into, which would silently
    // discard every unlock on a fresh install.
    await userStatsService.initializeUserStats();

    // `pages_read` / `book_completed` are optional columns, so both can be
    // absent rather than zero. Normalise before doing arithmetic on them.
    const pagesRead = session.pagesRead ?? 0;
    const bookCompleted = session.bookCompleted ?? false;
    const minutesRead = session.durationInMinutes ?? 0;
    const minutesReadToday = context?.minutesReadToday ?? minutesRead;

    const updatedProgress: UserStats = {
      ...userProgress,
      totalPagesRead: userProgress.totalPagesRead + pagesRead,
      totalReadingTime: userProgress.totalReadingTime + minutesRead,
      achievements: { ...userProgress.achievements },
    };

    // Update books completed
    if (bookCompleted) {
      updatedProgress.totalBooksCompleted += 1;
    }

    // Keep the fastest completion on record so the speed achievements (7/3/1
    // days) can actually be evaluated. Null means "no data yet" and must not
    // overwrite a real value.
    const fastestCompletionDays = context?.fastestCompletionDays;
    if (fastestCompletionDays != null && fastestCompletionDays >= 0) {
      updatedProgress.fastestBookCompletion = Math.min(
        updatedProgress.fastestBookCompletion === Infinity
          ? fastestCompletionDays
          : Math.min(
              updatedProgress.fastestBookCompletion,
              fastestCompletionDays
            )
      );
    }

    // Refresh streak through the shared stats service so the UI and the
    // achievement engine stay in sync. The gate is the reader's own daily
    // goal, not a hardcoded constant.
    const { dailyGoalMinutes } = usePreferencesStore.getState();
    const streakStats = await userStatsService.refreshDailyStreak(
      minutesReadToday,
      dailyGoalMinutes
    );
    if (streakStats) {
      updatedProgress.currentStreak = streakStats.currentStreak;
      updatedProgress.longestStreak = streakStats.longestStreak;
      updatedProgress.lastReadAt = streakStats.lastReadAt;
    }

    // Accrue XP as a ledger entry, freezing the streak bonus at award time so
    // losing a streak can never reduce XP already earned.
    const xpStats = await userStatsService.addXpForMinutes(
      minutesRead,
      updatedProgress.currentStreak
    );
    if (xpStats) {
      updatedProgress.totalXp = xpStats.totalXp;
    }

    // Check all achievements
    Object.values(updatedProgress.achievements).forEach(achievement => {
      if (!achievement.isUnlocked) {
        const shouldUnlock = checkAchievementCondition(
          achievement,
          updatedProgress
        );

        if (shouldUnlock) {
          const unlockedAchievement: Achievement = {
            ...achievement,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          };

          updatedProgress.achievements[achievement.id] = unlockedAchievement;
          newlyUnlocked.push(unlockedAchievement);
        }
      }
    });

    // Save to storage via the repository (single source of truth)
    userStatsRepository.updateUserStats(updatedProgress);

    // Update state
    set({
      userStats: updatedProgress,
      newlyUnlockedAchievements: newlyUnlocked,
    });
  },

  clearNewlyUnlocked: () => {
    set({ newlyUnlockedAchievements: [] });
  },

  getTotalPoints: () => {
    const { userStats: userProgress } = get();
    return Object.values(userProgress.achievements)
      .filter(a => a.isUnlocked)
      .reduce((total, achievement) => total + achievement.points, 0);
  },

  getAchievementsByCategory: category => {
    const { userStats: userProgress } = get();
    return Object.values(userProgress.achievements)
      .filter(a => a.category === category)
      .sort((a, b) => a.requirement - b.requirement);
  },

  resetProgress: () => {
    userStatsRepository.deleteUserStats();
    get().initializeAchievements();
  },
}));

function checkAchievementCondition(
  achievement: Achievement,
  progress: UserStats
): boolean {
  switch (achievement.category) {
    case 'pages':
      return progress.totalPagesRead >= achievement.requirement;

    case 'books':
      return progress.totalBooksCompleted >= achievement.requirement;

    case 'streak':
      return progress.currentStreak >= achievement.requirement;

    case 'time':
      return progress.totalReadingTime >= achievement.requirement;

    case 'speed':
      return progress.fastestBookCompletion <= achievement.requirement;

    default:
      return false;
  }
}
