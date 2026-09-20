// stores/achievementStore.ts
import { create } from 'zustand';
import UserStats from '@/src/Models/UserStats';
import { Achievement } from '@/src/types/achievement.types';
import ReadingSession from '@/src/Models/ReadingSession';
import { ACHIEVEMENT_DEFINITIONS } from '@/src/lib/achievements.config';
import UserStatsRepository from '@/src/repositories/UserStatsRepository';
import UserStatsService from '@/src/services/UserStatsService';

const userStatsRepository = new UserStatsRepository();
const userStatsService = new UserStatsService();

interface AchievementStore {
  userStats: UserStats;
  newlyUnlockedAchievements: Achievement[];

  // Actions
  initializeAchievements: () => void;
  processReadingSession: (session: ReadingSession) => Promise<void>;
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

  processReadingSession: async (session: ReadingSession) => {
    const { userStats: userProgress } = get();
    const newlyUnlocked: Achievement[] = [];

    // Update progress
    const updatedProgress: UserStats = {
      ...userProgress,
      totalPagesRead: userProgress.totalPagesRead + session.pagesRead,
      totalReadingTime:
        userProgress.totalReadingTime + session.durationInMinutes,
      achievements: { ...userProgress.achievements },
    };

    // Update books completed
    if (session.bookCompleted) {
      updatedProgress.totalBooksCompleted += 1;
    }

    // Refresh streak through the shared stats service so the UI and the
    // achievement engine stay in sync
    const streakStats = await userStatsService.refreshDailyStreak(
      session.durationInMinutes
    );
    if (streakStats) {
      updatedProgress.currentStreak = streakStats.currentStreak;
      updatedProgress.longestStreak = streakStats.longestStreak;
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
