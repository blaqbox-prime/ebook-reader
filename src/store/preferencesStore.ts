import { create } from 'zustand';
import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';

const STORAGE_KEY = 'reader_preferences';

const DEFAULT_DAILY_GOAL_MINUTES = 25;
export const DAILY_GOAL_OPTIONS = [15, 25, 45, 60];

export type ReaderThemePreference = 'light' | 'dark';
export type FontSizePreference = 'small' | 'medium' | 'large';
/**
 * `scroll` keeps the existing continuous-scroll layout (one scrolling document).
 * `paginated` renders discrete pages, which uses far less memory on large books.
 */
export type PageLayoutPreference = 'scroll' | 'paginated';

const DEFAULT_READER_THEME: ReaderThemePreference = 'light';
const DEFAULT_FONT_SIZE: FontSizePreference = 'medium';
const DEFAULT_PAGE_LAYOUT: PageLayoutPreference = 'scroll';

const isReaderTheme = (value: unknown): value is ReaderThemePreference =>
  value === 'light' || value === 'dark';

const isFontSize = (value: unknown): value is FontSizePreference =>
  value === 'small' || value === 'medium' || value === 'large';

const isPageLayout = (value: unknown): value is PageLayoutPreference =>
  value === 'scroll' || value === 'paginated';

interface ReaderPreferences {
  dailyGoalMinutes: number;
  readerTheme: ReaderThemePreference;
  fontSize: FontSizePreference;
  pageLayout: PageLayoutPreference;
}

interface PreferencesStore extends ReaderPreferences {
  setDailyGoalMinutes: (minutes: number) => void;
  setReaderTheme: (theme: ReaderThemePreference) => void;
  setFontSize: (size: FontSizePreference) => void;
  setPageLayout: (layout: PageLayoutPreference) => void;
  resetPreferences: () => void;
}

const defaults: ReaderPreferences = {
  dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
  readerTheme: DEFAULT_READER_THEME,
  fontSize: DEFAULT_FONT_SIZE,
  pageLayout: DEFAULT_PAGE_LAYOUT,
};

const loadPreferences = (): ReaderPreferences => {
  const saved = preferencesStorage.getString(STORAGE_KEY);
  if (!saved) {
    return defaults;
  }
  try {
    const parsed = JSON.parse(saved) as Partial<ReaderPreferences>;
    return {
      dailyGoalMinutes:
        typeof parsed.dailyGoalMinutes === 'number'
          ? parsed.dailyGoalMinutes
          : defaults.dailyGoalMinutes,
      readerTheme: isReaderTheme(parsed.readerTheme)
        ? parsed.readerTheme
        : defaults.readerTheme,
      fontSize: isFontSize(parsed.fontSize)
        ? parsed.fontSize
        : defaults.fontSize,
      pageLayout: isPageLayout(parsed.pageLayout)
        ? parsed.pageLayout
        : defaults.pageLayout,
    };
  } catch {
    return defaults;
  }
};

/**
 * Narrows the store state to the serializable preference values. The store also
 * holds setter functions, which must never reach the persistence payload.
 */
const pickPreferences = (state: PreferencesStore): ReaderPreferences => ({
  dailyGoalMinutes: state.dailyGoalMinutes,
  readerTheme: state.readerTheme,
  fontSize: state.fontSize,
  pageLayout: state.pageLayout,
});

const persist = (state: ReaderPreferences) => {
  preferencesStorage.set(STORAGE_KEY, JSON.stringify(state));
};

export const usePreferencesStore = create<PreferencesStore>(set => ({
  ...loadPreferences(),

  setDailyGoalMinutes: minutes => {
    set({ dailyGoalMinutes: minutes });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  setReaderTheme: theme => {
    set({ readerTheme: theme });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  setFontSize: size => {
    set({ fontSize: size });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  setPageLayout: layout => {
    set({ pageLayout: layout });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  resetPreferences: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set(defaults);
  },
}));
