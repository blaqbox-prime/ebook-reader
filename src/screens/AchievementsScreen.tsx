import { Header, SegmentedTabs } from '@/src/components';
import { SegmentedTab } from '@/src/components/SegmentedTabs';
import { useAchievementStore } from '@/src/store';
import { Achievement } from '@/src/types/achievement.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CategoryFilter = 'all' | Achievement['category'];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  pages: 'Pages',
  books: 'Books',
  streak: 'Streak',
  time: 'Time',
  speed: 'Speed',
};

const CATEGORY_ORDER: Achievement['category'][] = [
  'pages',
  'books',
  'streak',
  'time',
  'speed',
];

/**
 * Formats a requirement for display. Speed achievements are measured in days
 * while every other category is a plain count, so they need a unit.
 */
function formatRequirement(
  category: Achievement['category'],
  requirement: number
): string {
  if (category === 'time') {
    const hours = requirement / 60;
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  }
  if (category === 'speed') {
    return requirement === 1 ? '1 day' : `${requirement} days`;
  }
  if (category === 'streak') {
    return requirement === 1 ? '1 day' : `${requirement} days`;
  }
  return requirement.toLocaleString();
}

/**
 * Current progress toward an achievement, as a 0-1 ratio. Returns 0 when the
 * tracked value is unknown (e.g. no book has been finished yet), which is
 * different from being at zero.
 */
function getProgressRatio(
  achievement: Achievement,
  stats: {
    totalPagesRead: number;
    totalBooksCompleted: number;
    currentStreak: number;
    totalReadingTime: number;
    fastestBookCompletion: number;
  }
): number {
  let current = 0;
  switch (achievement.category) {
    case 'pages':
      current = stats.totalPagesRead;
      break;
    case 'books':
      current = stats.totalBooksCompleted;
      break;
    case 'streak':
      current = stats.currentStreak;
      break;
    case 'time':
      current = stats.totalReadingTime;
      break;
    case 'speed':
      // Lower is better, and Infinity means nothing has been finished yet.
      current = Number.isFinite(stats.fastestBookCompletion)
        ? stats.fastestBookCompletion
        : Number.POSITIVE_INFINITY;
      break;
  }
  if (!Number.isFinite(current) || current <= 0) return 0;
  return Math.min(current / achievement.requirement, 1);
}

const AchievementsScreen = () => {
  const router = useRouter();
  const userStats = useAchievementStore(state => state.userStats);
  const initializeAchievements = useAchievementStore(
    state => state.initializeAchievements
  );
  const [filter, setFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    initializeAchievements();
  }, [initializeAchievements]);

  const allAchievements = useMemo(
    () => Object.values(userStats.achievements ?? {}),
    [userStats.achievements]
  );

  const visibleAchievements = useMemo(() => {
    if (filter === 'all') return allAchievements;
    return allAchievements
      .filter(achievement => achievement.category === filter)
      .sort((a, b) => a.requirement - b.requirement);
  }, [allAchievements, filter]);

  const unlockedCount = useMemo(
    () => allAchievements.filter(a => a.isUnlocked).length,
    [allAchievements]
  );

  const totalPoints = useMemo(
    () =>
      allAchievements
        .filter(a => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0),
    [allAchievements]
  );

  const tabs: SegmentedTab[] = useMemo(
    () => [
      { key: 'all', label: 'All' },
      ...CATEGORY_ORDER.map(category => ({
        key: category,
        label: CATEGORY_LABELS[category],
      })),
    ],
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-6 flex-col">
          <View className="flex-row items-center justify-between mt-1 mb-4">
            <View className="flex-col flex-1 min-w-0">
              <Text className="font-heading text-[24px] leading-8 text-m3-on-surface">
                Achievements
              </Text>
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
                {unlockedCount} of {allAchievements.length} unlocked
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-m3-secondary-container rounded-full px-3 py-1.5 shadow-sm ml-3 flex-shrink-0">
              <MaterialIcons name="stars" size={18} color="#5c2d00" />
              <Text className="text-[12px] leading-4 font-semibold text-m3-on-secondary-container">
                {totalPoints} pts
              </Text>
            </View>
          </View>

          <SegmentedTabs
            tabs={tabs}
            activeKey={filter}
            onChange={key => setFilter(key as CategoryFilter)}
          />

          <View className="mt-5 gap-3">
            {visibleAchievements.length === 0 ? (
              <Text className="text-center text-m3-on-surface-variant text-[13px] leading-5 py-10">
                No achievements yet. Read to start earning XP.
              </Text>
            ) : (
              visibleAchievements.map(achievement => {
                const ratio = getProgressRatio(achievement, userStats);
                const percent = Math.round(ratio * 100);
                return (
                  <View
                    key={achievement.id}
                    className={`flex-row items-center rounded-2xl p-4 shadow-sm ${
                      achievement.isUnlocked
                        ? 'bg-m3-surface-low'
                        : 'bg-m3-surface-high'
                    }`}
                  >
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        achievement.isUnlocked
                          ? 'bg-m3-secondary-container'
                          : 'bg-m3-surface-variant'
                      }`}
                    >
                      <Text className="text-[20px]">
                        {achievement.isUnlocked ? achievement.icon : '🔒'}
                      </Text>
                    </View>

                    <View className="flex-1 ml-3 min-w-0">
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-[15px] leading-5 font-bold ${
                            achievement.isUnlocked
                              ? 'text-m3-on-surface'
                              : 'text-m3-on-surface-variant'
                          }`}
                          numberOfLines={1}
                        >
                          {achievement.title}
                        </Text>
                        <Text className="text-[11px] leading-4 text-m3-on-surface-variant ml-2">
                          {achievement.points} pts
                        </Text>
                      </View>
                      <Text
                        className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5"
                        numberOfLines={1}
                      >
                        {achievement.description}
                      </Text>

                      {achievement.isUnlocked ? (
                        <View className="flex-row items-center gap-1 mt-1.5">
                          <MaterialIcons
                            name="check-circle"
                            size={13}
                            color="#5c2d00"
                          />
                          <Text className="text-[11px] leading-4 text-m3-primary font-semibold">
                            Unlocked
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-2 mt-2">
                          <View className="flex-1 h-1.5 rounded-full bg-m3-surface-variant overflow-hidden">
                            <View
                              className="h-full rounded-full bg-m3-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </View>
                          <Text className="text-[10px] leading-4 text-m3-on-surface-variant">
                            {formatRequirement(
                              achievement.category,
                              achievement.requirement
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <Text
            className="text-center text-m3-on-surface-variant text-[11px] leading-4 mt-6"
            onPress={() => router.back()}
          >
            Earn XP each minute you read. Unlocks happen when you close a book.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AchievementsScreen;
