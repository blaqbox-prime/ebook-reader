import {
  DEFAULT_ONBOARDING_GENRES,
  ONBOARDING_ARCHETYPES,
  ONBOARDING_AVATAR_PRESETS,
  ONBOARDING_GENRES,
} from '@/src/constants/onboarding';
import { ActionToast, OnboardingDots, ToastIconName } from '@/src/components';
import AvatarStorageService from '@/src/services/AvatarStorageService';
import {
  useOnboardingStore,
  usePreferencesStore,
  useUserProfileStore,
} from '@/src/store';
import { ReaderArchetype } from '@/src/types/profile.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

const ICON_COLORS = {
  primary: '#5c2d00',
  onPrimary: '#ffffff',
  onSecondaryContainer: '#554424',
  onSurfaceVariant: '#52443b',
  secondary: '#6e5c39',
  outline: '#857469',
  onPrimaryFixedVariant: '#6c3a0c',
} as const;

const OnboardingProfileScreen = () => {
  const router = useRouter();
  const dailyGoalMinutes = usePreferencesStore(state => state.dailyGoalMinutes);
  const completeOnboarding = useOnboardingStore(
    state => state.completeOnboarding
  );
  const updateProfile = useUserProfileStore(state => state.updateProfile);
  const storedAvatarGlyph = useUserProfileStore(state => state.avatarGlyph);
  const storedDisplayName = useUserProfileStore(state => state.displayName);
  const storedArchetype = useUserProfileStore(state => state.archetype);
  const storedFavoriteGenres = useUserProfileStore(
    state => state.favoriteGenres
  );

  const [displayName, setDisplayName] = useState(storedDisplayName);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarGlyph, setAvatarGlyph] = useState<string | null>(
    storedAvatarGlyph ?? 'menu-book'
  );
  const [archetype, setArchetype] = useState<ReaderArchetype>(storedArchetype);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(
    storedFavoriteGenres.length > 0
      ? storedFavoriteGenres
      : DEFAULT_ONBOARDING_GENRES
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    icon?: ToastIconName;
  } | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
    },
    []
  );

  const showToast = useCallback((message: string, icon?: ToastIconName) => {
    setToast({ message, icon });
  }, []);

  const pickPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const [asset] = result.assets;
      if (asset) {
        setAvatarUri(asset.uri);
        showToast('Avatar updated', 'photo-camera');
      }
    } catch {
      showToast('Could not open your photo library', 'error');
    }
  }, [showToast]);

  const selectGlyph = (glyph: string) => {
    setAvatarGlyph(glyph);
    setAvatarUri(null);
    showToast('Avatar updated', 'palette');
  };

  const toggleGenre = (genre: string) => {
    setFavoriteGenres(current =>
      current.includes(genre)
        ? current.filter(item => item !== genre)
        : [...current, genre]
    );
  };

  const finish = async () => {
    if (isFinishing) return;

    const name = displayName.trim();
    if (!name) {
      showToast('Enter a display name to continue', 'error');
      return;
    }

    let persistedAvatarUri: string | null = avatarUri;
    try {
      if (avatarUri) {
        persistedAvatarUri = await AvatarStorageService.save(avatarUri);
      }

      updateProfile({
        displayName: name,
        avatarUri: persistedAvatarUri,
        avatarGlyph: persistedAvatarUri ? null : avatarGlyph,
        archetype,
        favoriteGenres,
      });

      completeOnboarding();
      setIsFinishing(true);
      showToast(`Welcome, ${name}! Opening your library...`, 'verified');
      finishTimer.current = setTimeout(
        () => router.replace('/(main)/(library)'),
        700
      );
    } catch {
      if (persistedAvatarUri) {
        await AvatarStorageService.remove(persistedAvatarUri);
      }
      showToast('Could not save your profile', 'error');
    }
  };

  const hasPhoto = Boolean(avatarUri);

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top']}>
      <View className="h-14 px-4 justify-center">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 -ml-2 items-center justify-center rounded-full active:bg-m3-surface-high"
            accessibilityRole="button"
            accessibilityLabel="Navigate back"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={ICON_COLORS.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void finish()}
            className="min-h-[44px] min-w-[44px] px-2 items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text className="text-[14px] leading-5 font-semibold text-m3-primary">
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="px-4">
          <View className="items-center mt-2 mb-6">
            <View className="bg-m3-secondary-container rounded-full px-3 py-1 flex-row items-center gap-1.5 mb-3 self-center shadow-sm">
              <MaterialIcons
                name="health-and-safety"
                size={16}
                color={ICON_COLORS.onSecondaryContainer}
              />
              <Text className="text-[11px] leading-4 font-semibold text-m3-on-secondary-container">
                100% Private &amp; Local Storage
              </Text>
            </View>
            <Text className="font-heading text-[28px] leading-9 font-semibold text-m3-on-surface text-center">
              Create Your Reader Profile
            </Text>
            <Text className="text-[14px] leading-5 text-m3-on-surface-variant max-w-[320px] mt-1 text-center">
              Your library, reading notes, and milestones stay strictly on this
              device. No cloud sync, no tracking.
            </Text>
          </View>

          <View className="items-center mb-6">
            <View className="mb-4">
              <View className="w-[104px] h-[104px] rounded-full overflow-hidden shadow-md bg-m3-surface-high items-center justify-center p-1">
                {hasPhoto ? (
                  <Image
                    source={{ uri: avatarUri as string }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    accessibilityLabel="Active reader avatar"
                  />
                ) : (
                  <View className="w-full h-full rounded-full bg-m3-primary-container items-center justify-center">
                    <MaterialIcons
                      name={(avatarGlyph as IconName) ?? 'menu-book'}
                      size={44}
                      color={ICON_COLORS.onPrimary}
                    />
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => void pickPhoto()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-m3-primary items-center justify-center shadow-lg active:scale-95"
                accessibilityRole="button"
                accessibilityLabel="Choose a photo"
              >
                <MaterialIcons
                  name="photo-camera"
                  size={18}
                  color={ICON_COLORS.onPrimary}
                />
              </TouchableOpacity>
            </View>

            <View className="w-full max-w-sm">
              <View className="flex-row items-center justify-between px-1 mb-2">
                <Text className="text-[11px] leading-4 font-semibold uppercase tracking-wider text-m3-on-surface-variant">
                  Choose Persona Icon
                </Text>
                <Text className="text-[11px] leading-4 font-semibold text-m3-primary">
                  Local Presets
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex-row items-center gap-2.5"
                contentContainerStyle={{
                  paddingHorizontal: 4,
                  paddingBottom: 4,
                }}
              >
                {ONBOARDING_AVATAR_PRESETS.map(preset => {
                  const isActive = !hasPhoto && avatarGlyph === preset.glyph;
                  return (
                    <TouchableOpacity
                      key={preset.glyph}
                      onPress={() => selectGlyph(preset.glyph)}
                      activeOpacity={0.75}
                      className={`w-12 h-12 rounded-full p-0.5 items-center justify-center shadow-sm ${
                        isActive ? 'bg-m3-primary' : 'bg-m3-surface-mid'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={`Use ${preset.glyph} avatar`}
                    >
                      <View className="w-full h-full rounded-full bg-m3-surface-high items-center justify-center">
                        <MaterialIcons
                          name={preset.glyph}
                          size={22}
                          color={ICON_COLORS.secondary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => void pickPhoto()}
                  activeOpacity={0.75}
                  className="w-12 h-12 rounded-full bg-m3-surface-high items-center justify-center active:scale-95"
                  accessibilityRole="button"
                  accessibilityLabel="Upload a custom image"
                >
                  <MaterialIcons
                    name={hasPhoto ? 'check' : 'add-a-photo'}
                    size={20}
                    color={
                      hasPhoto
                        ? ICON_COLORS.onSecondaryContainer
                        : ICON_COLORS.onSurfaceVariant
                    }
                  />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          <View className="gap-5 mb-6">
            <View>
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant mb-1.5 px-1">
                Reader Name
              </Text>
              <View className="flex-row items-center bg-m3-surface-highest rounded-2xl shadow-sm px-3.5 py-1">
                <MaterialIcons
                  name="face"
                  size={20}
                  color={ICON_COLORS.onSurfaceVariant}
                />
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="e.g. Jane Reader"
                  placeholderTextColor={ICON_COLORS.outline}
                  className="flex-1 ml-2.5 text-[16px] leading-6 text-m3-on-surface"
                  style={{ paddingVertical: 10 }}
                />
                {displayName.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => setDisplayName('')}
                    className="p-1 rounded-full active:bg-m3-surface-variant"
                    accessibilityRole="button"
                    accessibilityLabel="Clear name"
                  >
                    <MaterialIcons
                      name="cancel"
                      size={18}
                      color={ICON_COLORS.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between px-1 mb-1.5">
                <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
                  Reader Archetype
                </Text>
                <Text className="text-[11px] leading-4 text-m3-secondary">
                  Tap to switch
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {ONBOARDING_ARCHETYPES.map(option => {
                  const isActive = archetype === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      onPress={() => {
                        setArchetype(option.key);
                        showToast(`${option.title} archetype selected`, 'star');
                      }}
                      activeOpacity={0.8}
                      className={`w-[48%] rounded-2xl p-3 shadow-sm ${
                        isActive
                          ? 'bg-m3-secondary-container'
                          : 'bg-m3-surface-low'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={option.title}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <MaterialIcons
                          name={option.icon}
                          size={20}
                          color={
                            isActive
                              ? ICON_COLORS.onSecondaryContainer
                              : ICON_COLORS.secondary
                          }
                        />
                        {isActive ? (
                          <MaterialIcons
                            name="check-circle"
                            size={18}
                            color={ICON_COLORS.onSecondaryContainer}
                          />
                        ) : null}
                      </View>
                      <Text
                        className={`text-[14px] leading-5 ${
                          isActive
                            ? 'font-semibold text-m3-on-secondary-container'
                            : 'font-semibold text-m3-on-surface'
                        }`}
                      >
                        {option.title}
                      </Text>
                      <Text
                        className={`text-[12px] leading-4 mt-0.5 ${
                          isActive
                            ? 'text-m3-on-secondary-container/80'
                            : 'text-m3-on-surface-variant'
                        }`}
                      >
                        {option.subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between px-1 mb-2">
                <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
                  Favorite Shelves (Optional)
                </Text>
                <Text className="text-[11px] leading-4 text-m3-outline">
                  Multi-select
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {ONBOARDING_GENRES.map(genre => {
                  const isActive = favoriteGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      onPress={() => toggleGenre(genre)}
                      activeOpacity={0.8}
                      className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full shadow-sm ${
                        isActive
                          ? 'bg-m3-secondary-container'
                          : 'bg-m3-surface-low'
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={genre}
                    >
                      {isActive ? (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color={ICON_COLORS.onSecondaryContainer}
                        />
                      ) : null}
                      <Text
                        className={`text-[12px] leading-4 font-semibold ${
                          isActive
                            ? 'text-m3-on-secondary-container'
                            : 'text-m3-on-surface'
                        }`}
                      >
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View className="mb-8">
            <View className="p-4 rounded-2xl bg-m3-surface-low shadow-sm flex-row items-start gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-m3-primary-fixed items-center justify-center mt-0.5">
                <MaterialIcons
                  name="timer"
                  size={22}
                  color={ICON_COLORS.onPrimaryFixedVariant}
                />
              </View>
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] leading-5 font-semibold text-m3-on-surface">
                    Daily Goal: {dailyGoalMinutes} minutes
                  </Text>
                  <Text className="text-[11px] leading-4 font-semibold text-m3-primary">
                    Gentle Pace
                  </Text>
                </View>
                <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
                  Everything is stored offline on this device. Daily streaks
                  will trigger local milestone badges automatically.
                </Text>
              </View>
            </View>
          </View>

          <View className="items-center gap-3">
            <TouchableOpacity
              onPress={() => void finish()}
              activeOpacity={0.85}
              className="w-full h-14 rounded-full bg-m3-primary flex-row items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
              accessibilityRole="button"
              accessibilityLabel="Complete setup and enter library"
            >
              <Text className="text-[14px] leading-5 font-bold text-m3-on-primary">
                Complete Setup &amp; Enter Library
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={ICON_COLORS.onPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void finish()}
              className="py-2.5 px-4 active:opacity-75"
              accessibilityRole="button"
            >
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
                Customize later in Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ActionToast
        message={toast?.message ?? null}
        icon={toast?.icon}
        visible={toast !== null}
      />
      <View className="py-4 px-8 h-20 flex-row items-center justify-between">
        <View className="flex-row items-center justify-between">
          <OnboardingDots step={3} total={3} label="Step 3 of 3" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingProfileScreen;
