import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { isReaderArchetype, ReaderArchetype } from '@/src/types/profile.types';
import { create } from 'zustand';

const STORAGE_KEY = 'user_profile';

export const DEFAULT_DISPLAY_NAME = 'Reader';
export const DEFAULT_AVATAR_GLYPH = 'menu-book';
export const DEFAULT_ARCHETYPE: ReaderArchetype = 'bibliophile';

export interface UserProfile {
  displayName: string;
  avatarUri: string | null;
  avatarGlyph: string | null;
  archetype: ReaderArchetype;
  favoriteGenres: string[];
}

interface UserProfileStore extends UserProfile {
  updateProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
}

const getDefaultProfile = (): UserProfile => ({
  displayName: DEFAULT_DISPLAY_NAME,
  avatarUri: null,
  avatarGlyph: DEFAULT_AVATAR_GLYPH,
  archetype: DEFAULT_ARCHETYPE,
  favoriteGenres: [],
});

const loadProfile = (): UserProfile => {
  const saved = preferencesStorage.getString(STORAGE_KEY);
  if (!saved) return getDefaultProfile();

  try {
    const parsed = JSON.parse(saved) as Partial<UserProfile>;
    const displayName = parsed.displayName?.trim();
    const genres = Array.isArray(parsed.favoriteGenres)
      ? parsed.favoriteGenres.filter(
          (genre): genre is string => typeof genre === 'string'
        )
      : [];

    return {
      displayName: displayName || DEFAULT_DISPLAY_NAME,
      avatarUri:
        typeof parsed.avatarUri === 'string' && parsed.avatarUri.trim()
          ? parsed.avatarUri
          : null,
      avatarGlyph:
        typeof parsed.avatarGlyph === 'string' && parsed.avatarGlyph.trim()
          ? parsed.avatarGlyph
          : DEFAULT_AVATAR_GLYPH,
      archetype: isReaderArchetype(parsed.archetype)
        ? parsed.archetype
        : DEFAULT_ARCHETYPE,
      favoriteGenres: genres,
    };
  } catch {
    return getDefaultProfile();
  }
};

export const useUserProfileStore = create<UserProfileStore>(set => ({
  ...loadProfile(),

  updateProfile: profile => {
    const displayName = profile.displayName.trim() || DEFAULT_DISPLAY_NAME;
    const avatarUri = profile.avatarUri?.trim() || null;
    const avatarGlyph = profile.avatarGlyph?.trim() || null;
    const archetype = isReaderArchetype(profile.archetype)
      ? profile.archetype
      : DEFAULT_ARCHETYPE;
    const favoriteGenres = Array.isArray(profile.favoriteGenres)
      ? profile.favoriteGenres.filter(
          (genre): genre is string =>
            typeof genre === 'string' && !!genre.trim()
        )
      : [];
    const nextProfile = {
      displayName,
      avatarUri,
      avatarGlyph,
      archetype,
      favoriteGenres,
    };

    preferencesStorage.set(STORAGE_KEY, JSON.stringify(nextProfile));
    set(nextProfile);
  },

  resetProfile: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set(getDefaultProfile());
  },
}));
