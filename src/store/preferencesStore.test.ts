import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import { usePreferencesStore } from '@/src/store/preferencesStore';

const KEY = 'reader_preferences';

const defaults = () => ({
  dailyGoalMinutes: 25,
  readerTheme: 'light',
  fontSize: 'medium',
  pageLayout: 'scroll',
  reminderEnabled: true,
  reminderHour: 20,
  reminderMinute: 0,
});

const stored = () => JSON.parse(preferencesStorage.getString(KEY)!);

describe('preferencesStore', () => {
  beforeEach(() => {
    preferencesStorage.clearAll();
    usePreferencesStore.getState().resetPreferences();
  });

  describe('defaults', () => {
    it('ships the reminder on at the 8pm slot', () => {
      const state = usePreferencesStore.getState();

      expect(state.reminderEnabled).toBe(true);
      expect(state.reminderHour).toBe(20);
      expect(state.reminderMinute).toBe(0);
    });

    it('uses a 25 minute daily goal', () => {
      expect(usePreferencesStore.getState().dailyGoalMinutes).toBe(25);
    });
  });

  describe('persistence', () => {
    it('writes each changed preference', () => {
      const {
        setDailyGoalMinutes,
        setReaderTheme,
        setFontSize,
        setPageLayout,
      } = usePreferencesStore.getState();

      setDailyGoalMinutes(60);
      setReaderTheme('dark');
      setFontSize('large');
      setPageLayout('paginated');

      const saved = stored();
      expect(saved.dailyGoalMinutes).toBe(60);
      expect(saved.readerTheme).toBe('dark');
      expect(saved.fontSize).toBe('large');
      expect(saved.pageLayout).toBe('paginated');
    });

    it('never persists setter functions into the payload', () => {
      usePreferencesStore.getState().setReminderEnabled(false);

      const saved = stored();
      expect(Object.keys(saved).sort()).toEqual(Object.keys(defaults()).sort());
    });

    it('resets to defaults and clears the payload', () => {
      usePreferencesStore.getState().setReminderEnabled(false);
      usePreferencesStore.getState().resetPreferences();

      expect(usePreferencesStore.getState().reminderEnabled).toBe(true);
      expect(preferencesStorage.getString(KEY)).toBeUndefined();
    });
  });

  describe('setReminderTime', () => {
    it('accepts a valid 24h clock time', () => {
      usePreferencesStore.getState().setReminderTime(6, 5);

      const state = usePreferencesStore.getState();
      expect(state.reminderHour).toBe(6);
      expect(state.reminderMinute).toBe(5);
    });

    it('accepts the boundaries', () => {
      usePreferencesStore.getState().setReminderTime(0, 0);
      expect(usePreferencesStore.getState().reminderHour).toBe(0);

      usePreferencesStore.getState().setReminderTime(23, 59);
      expect(usePreferencesStore.getState().reminderHour).toBe(23);
      expect(usePreferencesStore.getState().reminderMinute).toBe(59);
    });

    it.each([
      [24, 0],
      [-1, 0],
      [1.5, 0],
      [Number.NaN, 0],
    ])('falls back to the default hour for %p', (hour, _minute) => {
      usePreferencesStore.getState().setReminderTime(hour as number, 0);

      expect(usePreferencesStore.getState().reminderHour).toBe(20);
    });

    it.each([60, -1, 12.5, Number.NaN])(
      'falls back to the default minute for %p',
      minute => {
        usePreferencesStore.getState().setReminderTime(9, minute);

        expect(usePreferencesStore.getState().reminderMinute).toBe(0);
      }
    );
  });

  describe('loading a saved payload', () => {
    const seed = (payload: unknown) =>
      preferencesStorage.set(
        KEY,
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      );

    const reload = () => {
      jest.resetModules();
      const mod = jest.requireActual<
        typeof import('@/src/store/preferencesStore')
      >('@/src/store/preferencesStore');
      return mod.usePreferencesStore.getState();
    };

    it('falls back to defaults for unparseable JSON', () => {
      seed('{ not json');

      const state = reload();
      expect(state.reminderHour).toBe(20);
      expect(state.reminderEnabled).toBe(true);
    });

    it('replaces an out-of-range stored hour with the default', () => {
      seed({ ...defaults(), reminderHour: 99 });

      expect(reload().reminderHour).toBe(20);
    });

    it('replaces an out-of-range stored minute with the default', () => {
      seed({ ...defaults(), reminderMinute: 61 });

      expect(reload().reminderMinute).toBe(0);
    });

    it('replaces an unknown theme with the default', () => {
      seed({ ...defaults(), readerTheme: 'neon' });

      expect(reload().readerTheme).toBe('light');
    });

    it('keeps a valid saved reminder time', () => {
      seed({
        ...defaults(),
        reminderHour: 7,
        reminderMinute: 45,
        reminderEnabled: false,
      });

      const state = reload();
      expect(state.reminderHour).toBe(7);
      expect(state.reminderMinute).toBe(45);
      expect(state.reminderEnabled).toBe(false);
    });
  });
});
