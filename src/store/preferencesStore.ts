import { create } from 'zustand';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';

const STORAGE_KEY = 'reader_preferences';

const DEFAULT_DAILY_GOAL_MINUTES = 25;
export const DAILY_GOAL_OPTIONS = [15, 25, 45, 60];

interface ReaderPreferences {
  dailyGoalMinutes: number;
}

interface PreferencesStore extends ReaderPreferences {
  setDailyGoalMinutes: (minutes: number) => void;
  resetPreferences: () => void;
}

const loadPreferences = (): ReaderPreferences => {
  const saved = preferencesStorage.getString(STORAGE_KEY);
  if (!saved) {
    return { dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES };
  }
  try {
    const parsed = JSON.parse(saved) as ReaderPreferences;
    return {
      dailyGoalMinutes:
        typeof parsed.dailyGoalMinutes === 'number'
          ? parsed.dailyGoalMinutes
          : DEFAULT_DAILY_GOAL_MINUTES,
    };
  } catch {
    return { dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES };
  }
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...loadPreferences(),

  setDailyGoalMinutes: (minutes: number) => {
    preferencesStorage.set(
      STORAGE_KEY,
      JSON.stringify({ dailyGoalMinutes: minutes })
    );
    set({ dailyGoalMinutes: minutes });
  },

  resetPreferences: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set({ dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES });
  },
}));
