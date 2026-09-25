import { images } from '@/assets';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import {
  ActionToast,
  EmptyStateView,
  Header,
  ProfileStatCard,
  SessionRow,
  ToastIconName,
  UserAvatar,
} from '@/src/components';
import { DAILY_GOAL_OPTIONS } from '@/src/store/preferencesStore';
import { Book } from '@/src/data/watermelondb/models';
import ReadingSession from '@/src/Models/ReadingSession';
import BookService from '@/src/services/BookService';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import AvatarStorageService from '@/src/services/AvatarStorageService';
import {
  useAchievementStore,
  useBookmarksStore,
  useOnboardingStore,
  usePreferencesStore,
  useUserProfileStore,
  useUserStatsStore,
} from '@/src/store';
import { buildHighlightsMarkdown } from '@/src/utils';
import { formatDuration, formatFileSize } from '@/src/utils/bookDetailsUtils';
import { getLevelInfo } from '@/src/utils/readerLevel';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortKey = 'recent' | 'oldest' | 'longest';
type IconName = ComponentProps<typeof MaterialIcons>['name'];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'longest', label: 'Longest first' },
];

const MAX_NAME_LENGTH = 50;

const APP_VERSION = Constants.expoConfig?.version ?? '2.0.0';

const webClipboard = (
  globalThis as unknown as {
    navigator?: { clipboard?: { writeText: (text: string) => Promise<void> } };
  }
).navigator?.clipboard;

const HabitatCard = ({
  icon,
  label,
  value,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-1 bg-m3-surface-mid rounded-xl p-4 flex-col gap-2 min-w-0"
  >
    <View className="w-9 h-9 rounded-full bg-m3-surface-highest items-center justify-center">
      <MaterialIcons name={icon} size={18} color="#52443b" />
    </View>
    <View className="flex-col gap-0.5 min-w-0">
      <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[14px] leading-5 text-m3-on-surface font-bold"
      >
        {value}
      </Text>
    </View>
  </TouchableOpacity>
);

const SettingsRow = ({
  icon,
  label,
  value,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center gap-3 px-4 py-3.5 ${
      last ? '' : 'border-b border-m3-surface-highest'
    }`}
  >
    <View className="w-10 h-10 rounded-xl bg-m3-surface-highest items-center justify-center">
      <MaterialIcons name={icon} size={20} color="#5c2d00" />
    </View>
    <View className="flex-col flex-1 min-w-0 gap-0.5">
      <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[11px] leading-4 text-m3-on-surface-variant"
      >
        {value}
      </Text>
    </View>
    <MaterialIcons name="chevron-right" size={20} color="#52443b" />
  </TouchableOpacity>
);

const Profile = () => {
  const router = useRouter();
  const { totalMinutesRead, currentXP, currentStreak } = useUserStatsStore();
  const { initializeAchievements, userStats } = useAchievementStore();
  const { bookmarks } = useBookmarksStore();
  const { dailyGoalMinutes, setDailyGoalMinutes } = usePreferencesStore();
  const {
    displayName,
    avatarUri,
    avatarGlyph,
    archetype,
    favoriteGenres,
    updateProfile,
  } = useUserProfileStore();

  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [isSortOpen, setSortOpen] = useState(false);
  const [isGoalOpen, setGoalOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftAvatarUri, setDraftAvatarUri] = useState<string | null>(
    avatarUri
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    icon?: ToastIconName;
  } | null>(null);

  const showToast = useCallback((message: string, icon?: ToastIconName) => {
    setToast({ message, icon });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = useCallback(async () => {
    const service = new SessionTrackingService();
    const bookService = new BookService();
    const [allSessions, allBooks] = await Promise.all([
      service.getAllSessions(),
      bookService.getBooks(),
    ]);
    setSessions(allSessions);
    setBooks(allBooks);
  }, []);

  useEffect(() => {
    initializeAchievements();
    void loadData();
  }, [initializeAchievements, loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const sortedSessions = useMemo(() => {
    const list = [...sessions];
    if (sortKey === 'oldest') {
      list.sort((a, b) => a.timeStart.getTime() - b.timeStart.getTime());
    } else if (sortKey === 'longest') {
      list.sort((a, b) => b.durationInMinutes - a.durationInMinutes);
    } else {
      list.sort((a, b) => b.timeStart.getTime() - a.timeStart.getTime());
    }
    return list;
  }, [sessions, sortKey]);

  const sequenceIdFor = (index: number): number =>
    sortKey === 'oldest' ? index + 1 : sessions.length - index;

  const sortLabel =
    SORT_OPTIONS.find(option => option.key === sortKey)?.label ?? '';

  const bookTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    books.forEach(book => {
      map[book.uri] = book.title;
    });
    return map;
  }, [books]);

  const memberSince = useMemo(() => {
    let earliest: Date | null = null;
    books.forEach(book => {
      if (!earliest || book.createdAt.getTime() < earliest.getTime()) {
        earliest = book.createdAt;
      }
    });
    sessions.forEach(session => {
      if (!earliest || session.timeStart.getTime() < earliest.getTime()) {
        earliest = session.timeStart;
      }
    });
    return earliest;
  }, [books, sessions]);

  const volumesRead = useMemo(
    () =>
      Math.max(
        books.filter(book => book.progress >= 100).length,
        userStats.totalBooksCompleted
      ),
    [books, userStats.totalBooksCompleted]
  );

  const storage = useMemo(() => {
    const totalBytes = books.reduce(
      (sum, book) => sum + (book.fileSize ?? 0),
      0
    );
    return { bytes: totalBytes, count: books.length };
  }, [books]);

  const memberSinceLabel = memberSince
    ? memberSince.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const levelInfo = useMemo(() => getLevelInfo(currentXP), [currentXP]);

  const handleNotifications = useCallback(() => {
    showToast('No new notifications', 'notifications-none');
  }, [showToast]);

  const handleTypography = useCallback(() => {
    showToast('Font preferences are managed in the Reader', 'text-fields');
  }, [showToast]);

  const handleAmbiance = useCallback(() => {
    showToast('Ambiance sounds are coming soon', 'coffee');
  }, [showToast]);

  const handleStorage = useCallback(() => {
    showToast('EPUB storage is managed from the Library', 'folder-open');
  }, [showToast]);

  const handleTheme = useCallback(() => {
    showToast('Reading themes are managed in the Reader', 'palette');
  }, [showToast]);

  const handleGoalSelected = (minutes: number) => {
    setDailyGoalMinutes(minutes);
    setGoalOpen(false);
    showToast(`Daily goal set to ${minutes} minutes`, 'flag');
  };

  const handleOpenProfileEditor = useCallback(() => {
    setDraftName(displayName);
    setDraftAvatarUri(avatarUri);
    setEditOpen(true);
  }, [avatarUri, displayName]);

  const handleSelectProfilePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const [asset] = result.assets;
      if (asset) setDraftAvatarUri(asset.uri);
    } catch {
      showToast('Could not open your photo library', 'error');
    }
  }, [showToast]);

  const handleRemoveProfilePhoto = useCallback(() => {
    setDraftAvatarUri(null);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    const nextDisplayName = draftName.trim();
    if (!nextDisplayName) {
      showToast('Enter a display name', 'error');
      return;
    }

    setIsSavingProfile(true);
    let persistedAvatarUri = avatarUri;

    try {
      if (draftAvatarUri && draftAvatarUri !== avatarUri) {
        persistedAvatarUri = await AvatarStorageService.save(draftAvatarUri);
      } else {
        persistedAvatarUri = draftAvatarUri;
      }

      updateProfile({
        displayName: nextDisplayName,
        avatarUri: persistedAvatarUri,
        avatarGlyph: persistedAvatarUri ? null : avatarGlyph,
        archetype,
        favoriteGenres,
      });

      if (avatarUri && avatarUri !== persistedAvatarUri) {
        await AvatarStorageService.remove(avatarUri);
      }

      setEditOpen(false);
      showToast('Profile updated', 'check-circle');
    } catch {
      if (persistedAvatarUri && persistedAvatarUri !== avatarUri) {
        await AvatarStorageService.remove(persistedAvatarUri);
      }
      showToast('Could not update your profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  }, [
    archetype,
    avatarGlyph,
    avatarUri,
    draftAvatarUri,
    draftName,
    favoriteGenres,
    showToast,
    updateProfile,
  ]);

  const handleExport = async () => {
    const markdown = buildHighlightsMarkdown(bookmarks);

    if (Platform.OS === 'web' && webClipboard) {
      try {
        await webClipboard.writeText(markdown);
        showToast('Highlights copied to clipboard!', 'content-copy');
      } catch {
        showToast('Could not copy highlights', 'error');
      }
      return;
    }

    try {
      await Share.share({ message: markdown });
      showToast('Highlights exported!', 'share');
    } catch {
      showToast('Could not export highlights', 'error');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'This clears your saved bookmarks, reading progress, and profile on this device. Your books stay in the library.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const profile = useUserProfileStore.getState();
            useBookmarksStore.getState().clearBookmarks();
            useAchievementStore.getState().resetProgress();
            usePreferencesStore.getState().resetPreferences();
            profile.resetProfile();
            await AvatarStorageService.remove(profile.avatarUri);
            showToast('Signed out of PageTurner', 'logout');
            router.navigate('/');
          },
        },
      ]
    );
  };

  const handleReplayOnboarding = useCallback(() => {
    useOnboardingStore.getState().resetOnboarding();
    router.replace('/onboarding');
  }, [router]);

  const rows = [
    {
      icon: 'folder-open' as IconName,
      label: 'Manage EPUB Storage',
      value: `${formatFileSize(storage.bytes) ?? '0 MB'} used · ${
        storage.count
      } offline books`,
      onPress: handleStorage,
    },
    {
      icon: 'share' as IconName,
      label: 'Export Highlights & Notes',
      value: `${bookmarks.length} highlights available`,
      onPress: handleExport,
    },
    {
      icon: 'palette' as IconName,
      label: 'Reading Theme & Tone',
      value: 'Light Mode',
      onPress: handleTheme,
    },
    {
      icon: 'replay' as IconName,
      label: 'Replay Onboarding',
      value: 'Restart the 2-step setup',
      onPress: handleReplayOnboarding,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top']}>
      <Header
        title="Profile"
        showNotifications
        onNotificationsPress={handleNotifications}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5c2d00"
          />
        }
      >
        <View className="px-6 flex-col">
          <View className="bg-m3-surface-mid rounded-2xl p-5 mt-1 flex-row items-start gap-4">
            <View className="relative">
              <UserAvatar
                size={64}
                accessibilityLabel={`${displayName}'s profile picture`}
              />
              <View className="absolute -bottom-0.5 -right-0.5 bg-m3-surface rounded-full">
                <MaterialIcons name="check-circle" size={18} color="#5c2d00" />
              </View>
            </View>
            <View className="flex-col flex-1 min-w-0 gap-0.5">
              <Text className="font-heading text-[20px] leading-7 text-m3-on-surface">
                {displayName}
              </Text>
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
                Avid Bibliophile · Member since {memberSinceLabel}
              </Text>
              <View className="flex-row items-center gap-1 self-start bg-m3-primary-fixed rounded-full px-2.5 py-0.5 mt-1">
                <MaterialIcons name="check" size={13} color="#301400" />
                <Text className="text-[11px] leading-4 text-m3-on-primary-fixed font-bold">
                  {volumesRead} Books Completed
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleOpenProfileEditor}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              className="w-9 h-9 rounded-full bg-m3-surface-highest items-center justify-center"
            >
              <MaterialIcons name="tune" size={20} color="#52443b" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-start gap-2 mt-3">
            <ProfileStatCard
              icon="timer"
              value={formatDuration(totalMinutesRead)}
              label="Total Reading"
            />
            <ProfileStatCard
              icon="local-fire-department"
              value={`${currentStreak} Days`}
              label="Active Streak"
              accent="secondary"
            />
            <ProfileStatCard
              icon="collections-bookmark"
              value={volumesRead.toString()}
              label="Volumes Read"
            />
          </View>

          <View className="bg-m3-surface-mid rounded-2xl p-5 mt-3 flex-col gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-full bg-m3-primary items-center justify-center">
                <MaterialIcons name="auto-awesome" size={22} color="#ffffff" />
              </View>
              <View className="flex-col flex-1 min-w-0">
                <Text className="text-[11px] leading-4 text-m3-on-surface-variant uppercase tracking-wide">
                  Reading Milestone
                </Text>
                <Text className="text-[15px] leading-5 text-m3-on-surface font-bold">
                  Level {levelInfo.level} · {levelInfo.title}
                </Text>
              </View>
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                {levelInfo.nextTitle}
              </Text>
            </View>
            <View className="flex-col gap-1.5">
              <View className="flex-row items-baseline justify-between">
                <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
                  {levelInfo.xpForCurrentLevel}{' '}
                  <Text className="text-m3-on-surface-variant">
                    / {levelInfo.xpTarget} XP
                  </Text>
                </Text>
                <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                  {levelInfo.xpRemaining} XP remaining
                </Text>
              </View>
              <View className="h-2 rounded-full bg-m3-surface-highest overflow-hidden">
                <View
                  className="h-full rounded-full bg-m3-primary"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </View>
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                {levelInfo.progressPercent}% to Level {levelInfo.level + 1}:{' '}
                {levelInfo.nextTitle}
              </Text>
            </View>
          </View>

          <View className="flex-col mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="auto-stories" size={20} color="#5c2d00" />
                <Text className="text-[15px] leading-5 font-bold text-m3-on-surface">
                  Reading Habitat
                </Text>
              </View>
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                Your reading kit
              </Text>
            </View>
            <View className="flex-row items-stretch gap-2">
              <HabitatCard
                icon="flag"
                label="Daily Goal"
                value={`${dailyGoalMinutes} mins`}
                onPress={() => setGoalOpen(true)}
              />
              <HabitatCard
                icon="text-fields"
                label="Typography"
                value="Literata"
                onPress={handleTypography}
              />
              <HabitatCard
                icon="coffee"
                label="Ambiance"
                value="Quiet Café"
                onPress={handleAmbiance}
              />
            </View>
          </View>

          <View className="flex-col mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="schedule" size={20} color="#5c2d00" />
                <Text className="text-[15px] leading-5 font-bold text-m3-on-surface">
                  Reading Sessions
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="bg-m3-secondary-container rounded-full px-2.5 py-1">
                  <Text className="text-[11px] leading-4 text-m3-on-secondary-container font-bold">
                    {sessions.length} total
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSortOpen(true)}
                  className="flex-row items-center gap-1 bg-m3-surface-low px-2.5 py-1 rounded-lg shadow-sm"
                >
                  <MaterialIcons name="sort" size={16} color="#52443b" />
                  <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                    {sortLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {sortedSessions.length === 0 ? (
              <EmptyStateView
                image={images.bookshelf}
                message={'No reading sessions yet.'}
                showButton={false}
              />
            ) : (
              <View className="bg-m3-surface-mid rounded-2xl px-4">
                {sortedSessions.map((session, index) => (
                  <View key={session.id}>
                    <SessionRow
                      session={session}
                      bookTitle={
                        bookTitleMap[session.bookUri] ?? 'Untitled book'
                      }
                      sequenceId={sequenceIdFor(index)}
                      onPress={handleStorage}
                    />
                    {index < sortedSessions.length - 1 ? (
                      <View className="h-px bg-m3-surface-highest" />
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="flex-col mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="settings" size={20} color="#5c2d00" />
                <Text className="text-[15px] leading-5 font-bold text-m3-on-surface">
                  Account & Library
                </Text>
              </View>
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                Preferences
              </Text>
            </View>
            <View className="bg-m3-surface-mid rounded-2xl overflow-hidden">
              {rows.map((row, index) => (
                <SettingsRow
                  key={row.label}
                  icon={row.icon}
                  label={row.label}
                  value={row.value}
                  last={index === rows.length - 1}
                  onPress={row.onPress}
                />
              ))}
            </View>
          </View>

          <View className="flex-col items-center mt-8 gap-4">
            <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
              PageTurner v{APP_VERSION} · Build 2024.11
            </Text>
            <TouchableOpacity
              onPress={handleSignOut}
              className="w-full bg-m3-surface-mid rounded-xl py-3.5 flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="logout" size={18} color="#ba1a1a" />
              <Text className="text-[14px] leading-5 text-m3-error font-semibold">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Actionsheet
        isOpen={isSortOpen}
        onClose={() => setSortOpen(false)}
        snapPoints={[35]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-m3-outline/40" />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full">
            <View className="flex-row items-center justify-between pb-2">
              <Text className="font-lato-black text-base text-m3-on-surface flex-1">
                Sort sessions
              </Text>
              <TouchableOpacity
                onPress={() => setSortOpen(false)}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map(option => {
              const active = option.key === sortKey;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setSortKey(option.key);
                    setSortOpen(false);
                    showToast(
                      `Sorted by ${option.label.toLowerCase()}`,
                      'sort'
                    );
                  }}
                  className="w-full flex-row items-center gap-3 px-3 py-2.5 rounded-xl"
                >
                  <MaterialIcons
                    name={active ? 'radio-button-checked' : 'radio-button-off'}
                    size={20}
                    color={active ? '#5c2d00' : '#52443b'}
                  />
                  <Text
                    className={`font-lato-regular text-base ${
                      active
                        ? 'text-m3-primary font-bold'
                        : 'text-m3-on-surface'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet
        isOpen={isGoalOpen}
        onClose={() => setGoalOpen(false)}
        snapPoints={[30]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-m3-outline/40" />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full">
            <View className="flex-row items-center justify-between pb-2">
              <Text className="font-lato-black text-base text-m3-on-surface flex-1">
                Daily reading goal
              </Text>
              <TouchableOpacity
                onPress={() => setGoalOpen(false)}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            </View>
            {DAILY_GOAL_OPTIONS.map(minutes => {
              const active = minutes === dailyGoalMinutes;
              return (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => handleGoalSelected(minutes)}
                  className="w-full flex-row items-center gap-3 px-3 py-2.5 rounded-xl"
                >
                  <MaterialIcons
                    name={active ? 'radio-button-checked' : 'radio-button-off'}
                    size={20}
                    color={active ? '#5c2d00' : '#52443b'}
                  />
                  <Text
                    className={`font-lato-regular text-base ${
                      active
                        ? 'text-m3-primary font-bold'
                        : 'text-m3-on-surface'
                    }`}
                  >
                    {minutes} minutes
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        snapPoints={[70]}
        isKeyboardDismissable
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-m3-outline/40" />
          </ActionsheetDragIndicatorWrapper>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <View className="flex-row items-center justify-between pb-2">
              <Text className="font-lato-black text-base text-m3-on-surface flex-1">
                Edit profile
              </Text>
              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                disabled={isSavingProfile}
                accessibilityRole="button"
                accessibilityLabel="Close profile editor"
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            </View>

            <View className="items-center mt-2">
              <TouchableOpacity
                onPress={() => void handleSelectProfilePhoto()}
                disabled={isSavingProfile}
                accessibilityRole="button"
                accessibilityLabel="Choose a profile photo"
                className="relative"
              >
                <UserAvatar uri={draftAvatarUri} size={80} />
                <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-m3-primary items-center justify-center">
                  <MaterialIcons
                    name="photo-camera"
                    size={17}
                    color="#ffffff"
                  />
                </View>
              </TouchableOpacity>
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant font-semibold mt-2">
                {draftAvatarUri
                  ? 'Change profile photo'
                  : 'Add a profile photo'}
              </Text>
            </View>

            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[11px] leading-4 text-m3-on-surface-variant uppercase tracking-wide">
                  Display name
                </Text>
                <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                  {draftName.length}/{MAX_NAME_LENGTH}
                </Text>
              </View>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Reader"
                placeholderTextColor="#857469"
                maxLength={MAX_NAME_LENGTH}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                textContentType="name"
                onSubmitEditing={() => void handleSaveProfile()}
                className="bg-m3-surface-mid rounded-xl px-4 py-3 text-[15px] leading-5 text-m3-on-surface font-semibold"
              />
            </View>

            {draftAvatarUri ? (
              <TouchableOpacity
                onPress={handleRemoveProfilePhoto}
                disabled={isSavingProfile}
                accessibilityRole="button"
                className="w-full flex-row items-center justify-center gap-2 py-3 mt-1"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={18}
                  color="#ba1a1a"
                />
                <Text className="text-[13px] leading-5 text-m3-error font-semibold">
                  Remove photo
                </Text>
              </TouchableOpacity>
            ) : null}

            <View className="flex-row items-center gap-2 mt-3">
              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                disabled={isSavingProfile}
                accessibilityRole="button"
                className="flex-1 bg-m3-surface-mid rounded-xl py-3.5 items-center justify-center"
              >
                <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void handleSaveProfile()}
                disabled={isSavingProfile || !draftName.trim()}
                accessibilityRole="button"
                className={`flex-1 rounded-xl py-3.5 items-center justify-center ${
                  isSavingProfile || !draftName.trim()
                    ? 'bg-m3-surface-highest'
                    : 'bg-m3-primary'
                }`}
              >
                <Text
                  className={`text-[14px] leading-5 font-semibold ${
                    isSavingProfile || !draftName.trim()
                      ? 'text-m3-on-surface-variant'
                      : 'text-white'
                  }`}
                >
                  {isSavingProfile ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ActionsheetContent>
      </Actionsheet>

      <ActionToast
        message={toast?.message ?? null}
        icon={toast?.icon}
        visible={toast !== null}
      />
    </SafeAreaView>
  );
};

export default Profile;
