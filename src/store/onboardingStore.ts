import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { create } from 'zustand';

const STORAGE_KEY = 'onboarding_state';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
}

interface OnboardingStore extends OnboardingState {
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const loadOnboarding = (): OnboardingState => {
  const saved = preferencesStorage.getString(STORAGE_KEY);
  if (!saved) return { hasCompletedOnboarding: false };

  try {
    const parsed = JSON.parse(saved) as Partial<OnboardingState>;
    return {
      hasCompletedOnboarding: parsed.hasCompletedOnboarding === true,
    };
  } catch {
    return { hasCompletedOnboarding: false };
  }
};

export const useOnboardingStore = create<OnboardingStore>(set => ({
  ...loadOnboarding(),

  completeOnboarding: () => {
    preferencesStorage.set(
      STORAGE_KEY,
      JSON.stringify({ hasCompletedOnboarding: true })
    );
    set({ hasCompletedOnboarding: true });
  },

  resetOnboarding: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set({ hasCompletedOnboarding: false });
  },
}));
