// stores/achievementStore.ts
import { create } from 'zustand';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import UserStats from '@/src/Models/UserStats';
import { Achievement } from '@/src/types/achievement.types';
import ReadingSession from '@/src/Models/ReadingSession';
import { ACHIEVEMENT_DEFINITIONS } from '@/src/lib/achievements.config';
import UserStatsRepository from '@/src/repositories/UserStatsRepository';

const storage = preferencesStorage;
const userStatsRepository = new UserStatsRepository();

interface AchievementStore {
  userStats: UserStats;
  newlyUnlockedAchievements: Achievement[];

  // Actions
  initializeAchievements: () => void;
  processReadingSession: (session: ReadingSession) => void;
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
      set({ userStats: savedProgress });
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

      userStatsRepository.updateUserStats(progress);
      set({ userStats: progress });
    }
  },

  processReadingSession: (session: ReadingSession) => {
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

    // Update streak (simplified - in production, use proper date logic)
    updatedProgress.currentStreak = calculateStreak(
      session.timeEnd.toISOString()
    );
    updatedProgress.longestStreak = Math.max(
      updatedProgress.longestStreak,
      updatedProgress.currentStreak
    );

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

    // Save to storage
    storage.set('user_stats', JSON.stringify(updatedProgress));

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
    storage.remove('user_stats');
    get().initializeAchievements();
  },
}));

// Helper Functions
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

function calculateStreak(sessionEndDate: string): number {
  // Simplified streak calculation
  // In production, implement proper logic with date comparisons
  const lastSession = storage.getString('lastSessionDate');
  const today = new Date(sessionEndDate).toDateString();

  if (!lastSession) {
    storage.set('lastSessionDate', today);
    storage.set('currentStreak', '1');
    return 1;
  }

  const lastDate = new Date(lastSession);
  const currentDate = new Date(sessionEndDate);
  const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let streak = parseInt(storage.getString('currentStreak') || '1');

  if (diffDays === 1) {
    // Consecutive day
    streak += 1;
  } else if (diffDays > 1) {
    // Streak broken
    streak = 1;
  }
  // Same day reading doesn't change streak

  storage.set('lastSessionDate', today);
  storage.set('currentStreak', streak.toString());

  return streak;
}
