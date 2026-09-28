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

/**
 * The reminder defaults to on and to the 8pm slot the service shipped with, so
 * adding this preference does not change behaviour for anyone already running
 * the app. Turning it off is an explicit, persisted choice.
 */
const DEFAULT_REMINDER_ENABLED = true;
const DEFAULT_REMINDER_HOUR = 20;
const DEFAULT_REMINDER_MINUTE = 0;

const isReaderTheme = (value: unknown): value is ReaderThemePreference =>
  value === 'light' || value === 'dark';

const isFontSize = (value: unknown): value is FontSizePreference =>
  value === 'small' || value === 'medium' || value === 'large';

const isPageLayout = (value: unknown): value is PageLayoutPreference =>
  value === 'scroll' || value === 'paginated';

/**
 * Clamps to a valid 24h clock time. The payload is read straight out of MMKV, so
 * a hand-edited or corrupted value must never be able to reach the notification
 * trigger, which would throw at schedule time and silently lose the reminder.
 */
const isHour = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 23;

const isMinute = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 59;

interface ReaderPreferences {
  dailyGoalMinutes: number;
  readerTheme: ReaderThemePreference;
  fontSize: FontSizePreference;
  pageLayout: PageLayoutPreference;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

interface PreferencesStore extends ReaderPreferences {
  setDailyGoalMinutes: (minutes: number) => void;
  setReaderTheme: (theme: ReaderThemePreference) => void;
  setFontSize: (size: FontSizePreference) => void;
  setPageLayout: (layout: PageLayoutPreference) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (hour: number, minute: number) => void;
  resetPreferences: () => void;
}

const defaults: ReaderPreferences = {
  dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
  readerTheme: DEFAULT_READER_THEME,
  fontSize: DEFAULT_FONT_SIZE,
  pageLayout: DEFAULT_PAGE_LAYOUT,
  reminderEnabled: DEFAULT_REMINDER_ENABLED,
  reminderHour: DEFAULT_REMINDER_HOUR,
  reminderMinute: DEFAULT_REMINDER_MINUTE,
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
      reminderEnabled:
        typeof parsed.reminderEnabled === 'boolean'
          ? parsed.reminderEnabled
          : defaults.reminderEnabled,
      reminderHour: isHour(parsed.reminderHour)
        ? parsed.reminderHour
        : defaults.reminderHour,
      reminderMinute: isMinute(parsed.reminderMinute)
        ? parsed.reminderMinute
        : defaults.reminderMinute,
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
  reminderEnabled: state.reminderEnabled,
  reminderHour: state.reminderHour,
  reminderMinute: state.reminderMinute,
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

  setReminderEnabled: enabled => {
    set({ reminderEnabled: enabled });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  setReminderTime: (hour, minute) => {
    set({
      reminderHour: isHour(hour) ? hour : DEFAULT_REMINDER_HOUR,
      reminderMinute: isMinute(minute) ? minute : DEFAULT_REMINDER_MINUTE,
    });
    persist(pickPreferences(usePreferencesStore.getState()));
  },

  resetPreferences: () => {
    preferencesStorage.remove(STORAGE_KEY);
    set(defaults);
  },
}));
