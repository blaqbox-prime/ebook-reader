import { renderHook } from '@testing-library/react-native';

import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';

// `createMockMMKV` ships in the package but is deliberately NOT re-exported
// from the public entrypoint, so we reach into it directly. See
// node_modules/react-native-mmkv/src/index.ts.
//
// The instance is memoised on globalThis so that `jest.resetModules()` (used to
// re-import a store and exercise its load-time parsing) does not hand the
// re-imported module a brand-new, empty store.
jest.mock('react-native-mmkv', () => {
  const {
    createMockMMKV,
  } = require('react-native-mmkv/src/createMMKV/createMockMMKV');

  const key = '__mmkvTestInstance';
  if (!(key in globalThis)) {
    (globalThis as Record<string, unknown>)[key] = createMockMMKV({
      id: 'test.storage',
    });
  }
  const instance = (globalThis as Record<string, unknown>)[key];

  return { createMMKV: () => instance, __instance: instance };
});

/**
 * Component-shaped mocks live in their own modules. Inline in a `jest.mock`
 * factory, NativeWind's babel plugin injects a `_ReactNativeCSSInterop` import
 * that babel-plugin-jest-hoist then rejects as an out-of-scope reference.
 */
jest.mock(
  '@react-native-community/datetimepicker',
  () => require('@/src/test/mocks/DateTimePickerMock').default
);

jest.mock('@epubjs-react-native/core', () =>
  require('@/src/test/mocks/EpubMock')
);

jest.mock('@epubjs-react-native/expo-file-system', () => ({
  useFileSystem: () => ({
    getEpub: jest.fn().mockResolvedValue({}),
    open: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue(undefined),
    fs: { base: 'file:///documents/' },
  }),
}));

/**
 * `src/data/index.ts` re-exports `preferencesStorage` *and* `watermelondb`, and
 * the real `src/data/watermelondb` module constructs a SQLiteAdapter at import
 * time. That needs the native WMDatabaseBridge, so merely importing anything
 * from `@/src/data` (as NotificationsService and BookmarkService do) would
 * throw before a single assertion ran. Swapping in the in-memory LokiJS
 * database keeps those imports working.
 *
 * Built lazily behind a getter so suites that never touch the database do not
 * pay for constructing it.
 */
jest.mock('@/src/data/watermelondb', () => {
  let db: unknown;
  const load = () => {
    if (!db) {
      // Required lazily: jest hoists these factories above the imports.
      const { Database } = require('@nozbe/watermelondb');
      const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs');
      const logger = require('@nozbe/watermelondb/utils/common/logger').default;
      const Book = require('@/src/Models/Book').default;
      const Metadata = require('@/src/Models/Metadata').default;
      const ReadingSession = require('@/src/Models/ReadingSession').default;
      const schema = require('@/src/data/watermelondb/schema').default;
      const migrations = require('@/src/data/watermelondb/migrations').default;

      logger.silence();

      db = new Database({
        adapter: new LokiJSAdapter({
          schema,
          migrations,
          dbName: 'setup_db',
          useWebWorker: false,
          useIncrementalIndexedDB: false,
          onSetUpError: (error: Error) => {
            throw error;
          },
        }),
        modelClasses: [Book, Metadata, ReadingSession],
      });
    }
    return db;
  };

  const dbProxy = new Proxy(
    {},
    {
      get: (_target, prop) =>
        (load() as Record<string | symbol, unknown>)[prop],
    }
  );

  return { __esModule: true, default: dbProxy };
});

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted', granted: true }),
  requestPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted', granted: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('scheduled-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(true),
  dismissNotificationAsync: jest.fn().mockResolvedValue(true),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPresentedNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn().mockResolvedValue('channel-id'),
  setNotificationHandler: jest.fn(),
  AndroidNotificationPriority: { HIGH: 'high', DEFAULT: 'default', LOW: 'low' },
  AndroidImportance: { MIN: 1, LOW: 2, DEFAULT: 3, HIGH: 4, MAX: 5 },
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    DAILY: 'daily',
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
  Platform: { OS: 'ios' },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest
    .fn()
    .mockResolvedValue({ canceled: true, assets: null }),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
  requestPermissionAsync: jest.fn().mockResolvedValue({ granted: true }),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-brightness', () => ({
  getBrightnessAsync: jest.fn().mockResolvedValue(0.5),
  setBrightnessAsync: jest.fn().mockResolvedValue(undefined),
  restoreSystemBrightnessAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system', () => {
  const files = new Map<string, string>();
  return {
    documentDirectory: 'file:///documents/',
    cacheDirectory: 'file:///cache/',
    EncodingType: { UTF8: 'utf8', Base64: 'base64' },
    getInfoAsync: jest.fn(async (uri: string) => ({ exists: files.has(uri) })),
    readAsStringAsync: jest.fn(async (uri: string) => {
      if (!files.has(uri)) throw new Error(`ENOENT: ${uri}`);
      return files.get(uri) as string;
    }),
    writeAsStringAsync: jest.fn(async (uri: string, contents: string) => {
      files.set(uri, contents);
    }),
    deleteAsync: jest.fn(async (uri: string) => {
      files.delete(uri);
    }),
    makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
    readDirectoryAsync: jest.fn().mockResolvedValue([]),
    copyAsync: jest.fn().mockResolvedValue(undefined),
    moveAsync: jest.fn().mockResolvedValue(undefined),
    __files: files,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismiss: jest.fn(),
    navigate: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
  useFocusEffect: (cb: () => void | (() => void)) => cb(),
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

global.__reanimatedWorkletInit = jest.fn();
global.IS_REACT_ACT_ENVIRONMENT = true;

// A smoke assertion so a broken harness fails loudly at setup rather than
// reporting a confusing "0 tests" success.
describe('harness self-check', () => {
  it('boots with MMKV, RTL, and the metro babel caller', async () => {
    preferencesStorage.set('harness', 'ok');
    expect(preferencesStorage.getString('harness')).toBe('ok');
    preferencesStorage.remove('harness');
    // RTL v14 made render/renderHook async; they return promises.
    const { result } = await renderHook(() => 1 + 1);
    expect(result.current).toBe(2);
  });
});

export {};
