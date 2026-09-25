import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { create } from 'zustand';

const STORAGE_KEY = 'user_profile';

export const DEFAULT_DISPLAY_NAME = 'Reader';

export interface UserProfile {
  displayName: string;
  avatarUri: string | null;
}

interface UserProfileStore extends UserProfile {
  updateProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
}

const getDefaultProfile = (): UserProfile => ({
  displayName: DEFAULT_DISPLAY_NAME,
  avatarUri: null,
});

const loadProfile = (): UserProfile => {
  const saved = preferencesStorage.getString(STORAGE_KEY);
  if (!saved) return getDefaultProfile();

  try {
    const parsed = JSON.parse(saved) as Partial<UserProfile>;
    const displayName = parsed.displayName?.trim();

    return {
      displayName: displayName || DEFAULT_DISPLAY_NAME,
      avatarUri:
        typeof parsed.avatarUri === 'string' && parsed.avatarUri.trim()
          ? parsed.avatarUri
          : null,
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
    const nextProfile = { displayName, avatarUri };

    preferencesStorage.set(STORAGE_KEY, JSON.stringify(nextProfile));
    set(nextProfile);
  },

  resetProfile: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set(getDefaultProfile());
  },
}));
