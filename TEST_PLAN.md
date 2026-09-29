# Test Plan — ebook-reader

Status: harness live, Tier 1 + per-area smoke suites green. Last verified:
`11 suites / 181 passing / 47 todo`, `tsc --noEmit` clean, `eslint` clean.

## 1. Purpose and rules

The suite exists to pin down the money paths of an offline EPUB reader: the
numbers a user would notice being wrong (time, pages, XP, streaks, stats) and
the state that must survive a restart (sessions, bookmarks, preferences,
achievements, scheduled reminders).

Four rules govern every test in this repo:

1. **Tests assert intended behaviour, never current behaviour.** If the app is
   wrong, the test fails and the bug gets fixed. We never write a passing test
   that enshrines a bug.
2. **Known defects are `it.todo`, not skipped or commented-out assertions.**
   This keeps the suite green and mergeable while making the debt visible and
   grep-able. Every `it.todo` names a `BUG-NN` id.
3. **The central registry is `src/knownBugs.test.ts`.** It holds one `it.todo`
   per defect with the file/line where it was observed. When you fix a bug,
   delete its `it.todo` there, promote the corresponding assertion in the
   feature suite, and add the regression test.
4. **Pure logic first, components last.** Repositories, services, stores and
   utils are cheap to test and hold the actual logic. Screens are covered last
   and only for wiring.

## 2. Running the suite

```bash
npm test                # single run
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
npm run validate        # type-check + lint + format:check + test
```

CI runs a `test` job (type-check + `jest --ci --coverage`) in parallel with the
existing lint/format job, in both `.github/workflows/ci.yml` (PRs to `v2`) and
`.github/workflows/ci_dev.yml` (PRs to `dev`).

Current line coverage is ~24%. That number is low on purpose: it is measuring
untested UI, not untested logic. The logic layers are where the risk is, and
they are well covered (`services` 57%, `store` 49%, `repositories` 33%). Use the
per-directory table in section 6 to decide what to add next, not the headline
figure.

## 3. Harness

### Dependencies

Pinned in `devDependencies`:

| Package                         | Version    | Why                                        |
| ------------------------------- | ---------- | ------------------------------------------ |
| `jest`                          | `~29.7.0`  | Matches `jest-expo`'s peer range           |
| `jest-expo`                     | `~53.0.14` | Expo SDK 53 preset                         |
| `@testing-library/react-native` | `^14.0.1`  | Component/hook rendering                   |
| `test-renderer`                 | `^1.3.0`   | RTL 14 peer dependency                     |
| `@types/jest`                   | `^29.5.14` | **Downgraded** from `^30` to match Jest 29 |

### `jest.config.js`

```js
module.exports = {
  preset: 'jest-expo/ios',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  modulePathIgnorePatterns: ['<rootDir>/.expo/', '<rootDir>/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/**/index.ts',
  ],
  clearMocks: true,
  restoreMocks: true,
  forceExit: true,
};
```

Four decisions worth understanding before you change any of them:

- **`jest-expo/ios`, not `jest-expo/universal`.** The universal preset is a
  4-project config that runs every suite under `ios/`, `android/`, `web/` and
  `node/`. Our logic is deliberately platform-agnostic, so that would quadruple
  the suite for no signal. The iOS preset also matches the `caller.platform`
  that jest-expo passes to Babel, which is what resolves the `module-resolver`
  `@/` alias and the decorator plugins.
- **`forceExit: true`.** WatermelonDB's LokiJS adapter leaves a debounced-save
  timer pending after a suite finishes, so Jest waits forever for the worker to
  exit. The handle is third-party and fires after all assertions have run, so
  forcing exit is safe; pass/fail is still reported honestly. If you ever swap
  the Loki adapter, remove this.
- **`clearMocks` + `restoreMocks`.** Jest clears calls between tests but does
  **not** reset `mockImplementation`, so a mocked module that was configured in
  one test would silently leak into the next. Tests that rely on a configured
  mock must re-establish it in their own `beforeEach`.
- **Coverage excludes `src/test/**`\*\*, otherwise the mocks inflate the
  numbers.

### `jest.setup.ts` global mocks

| Mock                                                                                                                            | Approach                                | Note                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react-native-mmkv`                                                                                                             | `createMockMMKV` via deep import        | v4 does not re-export it from the entrypoint. The instance is memoised on `globalThis` so `jest.resetModules()` does not hand a re-imported store a fresh, empty storage |
| `@/src/data/watermelondb`                                                                                                       | lazy LokiJS in-memory database          | Production SQLite needs a native bridge. Defined as a `Proxy` so modules importing the singleton are never constructed at import time                                    |
| `expo-notifications`                                                                                                            | in-memory trigger store                 | Lets reminder tests assert on scheduled/cancelled triggers                                                                                                               |
| `@epubjs-react-native/core`                                                                                                     | `src/test/mocks/EpubMock.ts`            | The app depends on `@epubjs-react-native/core`; there is no direct `epubjs` dependency                                                                                   |
| `expo-image-picker`                                                                                                             | deterministic result queue              | Lets tests drive both success and denial paths                                                                                                                           |
| `expo-haptics`, `expo-brightness`, `expo-file-system`, `expo-router`, `react-native-gesture-handler`, `react-native-reanimated` | no-op / host component                  |                                                                                                                                                                          |
| `@react-native-community/datetimepicker`                                                                                        | `src/test/mocks/DateTimePickerMock.tsx` | Must be a separate module, see below                                                                                                                                     |

**Component-shaped mocks must not be inlined.** NativeWind injects a
`_ReactNativeCSSInterop` call into the transform of any file containing a JSX
component, and `babel-plugin-jest-hoist` rejects `require` calls of non-builtins
inside `jest.mock` factories. Inlining an `() => <View/>` in a factory therefore
fails with a hoisting error before any test runs. Every component mock lives in
its own file under `src/test/mocks/`.

**RTL 14 is async.** `render` and `renderHook` return promises and must be
awaited.

### `src/test/` utilities

- `database.ts` — `makeTestDb()` returns a real WatermelonDB instance on a fresh
  LokiJS adapter, using the real schema and migrations. It silences the adapter
  logger so setup does not spam output.
- `mmkv.ts` — clears the shared MMKV mock.
- `factories.ts` — `makeSession`, `makeBookmark`, `daysAgo`, `atLocalMidnight`.
  `makeSession` returns a structurally-populated stand-in cast to
  `ReadingSession`, because `processReadingSession` only reads `pagesRead`,
  `bookCompleted` and `durationInMinutes` (the last being a getter on the real
  model) and a real DB write per case would dominate runtime.

## 4. Suites

| Suite                                          | Layer      | Covers                                                                 |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `src/repositories/SessionRepository.test.ts`   | repository | Session writes, reads, latest-session, orphan recovery (`BUG-01`)      |
| `src/repositories/UserStatsRepository.test.ts` | repository | Aggregate stat queries                                                 |
| `src/services/UserStatsService.test.ts`        | service    | Stats composition                                                      |
| `src/services/BookmarkService.test.ts`         | service    | Add/remove/clear, scoping by book, corrupt payload (`BUG-30`)          |
| `src/services/NotificationsService.test.ts`    | service    | Scheduling, cancel, refresh, test-send, delivered dismissal (`BUG-37`) |
| `src/store/achievementStore.test.ts`           | store      | Unlock rules, dedupe, XP and page milestones (`BUG-09`)                |
| `src/store/preferencesStore.test.ts`           | store      | Defaults, persistence, corrupt-payload fallback                        |
| `src/utils/readerLevel.test.ts`                | util       | Level curve, XP within level (`BUG-23`)                                |
| `src/utils/bookDetailsUtils.test.ts`           | util       | Page/rating/size/date formatting, derived stats (`BUG-18`)             |
| `src/utils/formatTimestamp.test.ts`            | util       | Relative date labels across day/year boundaries                        |
| `src/knownBugs.test.ts`                        | registry   | One `it.todo` per known defect, with file/line evidence                |

## 5. Known defects

36 defects are registered in `src/knownBugs.test.ts` and surface as 47 `it.todo`
across the suite. The highest-value ones to fix first:

| ID                | Summary                                                                                                                                                                                                                                                         | Fix shape                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `BUG-01`          | `reading_sessions.time_end_at` is non-optional in `schema.js:48` but written as `null` in `SessionRepository.ts:45`; WatermelonDB coerces it to `0`, so recovery's `where("time_end_at", null)` matches nothing and orphan rows report a huge negative duration | Schema v10 with `isOptional: true` + migration |
| `BUG-29`          | `migrations.js` only defines toVersion 7, 8, 9 — an install already on schema 5 or lower cannot upgrade at all                                                                                                                                                  | Write the missing 1–6 migrations               |
| `BUG-30`          | `BookmarkService` `JSON.parse`s storage in its constructor with no guard, so a truncated value takes down app boot                                                                                                                                              | Wrap parse, fall back to `[]`                  |
| `BUG-36`          | `refreshDailyReminder` clears the stored id before delegating, so the inner cancel no-ops and the old OS trigger is orphaned                                                                                                                                    | Reorder cancel/clear                           |
| `BUG-23`          | `readerLevel.ts:61` returns the lifetime total as `xpForCurrentLevel`, so the XP card disagrees with its own bar                                                                                                                                                | Subtract the level floor                       |
| `BUG-11`/`BUG-12` | Forward scroll jumps credit every skipped page, and printed vs location-derived page counts are mixed in one total, so page achievements are farmable                                                                                                           | Cap delta, pick one page source                |

## 6. Coverage by directory

Current, as of the run above:

| Directory      | % Stmts | Reading                                                                   |
| -------------- | ------- | ------------------------------------------------------------------------- |
| `data/mmkv`    | 100     | Thin wrapper, exercised via the stores                                    |
| `lib`          | 100     | Achievement config is a pure data table                                   |
| `Models`       | 46      | `Metadata`/`UserStats` 100%; `Book` and `ReadingSession` mostly uncovered |
| `services`     | 57      | The best-covered logic layer                                              |
| `store`        | 49      | `preferencesStore`/`achievementStore` covered; `libraryStore` 0%          |
| `repositories` | 33      | `UserStatsRepository` covered; `SessionRepository` partial                |
| `utils`        | 30      | The three tested utils covered; the rest is formatting-heavy              |
| `components`   | 0       | Nothing rendered yet                                                      |
| `screens`      | 0       | Nothing rendered yet                                                      |

### What to add next

1. **`libraryStore` and `LibraryScreen` (0%).** Import, duplicate detection and
   delete flow. This is the largest untested block and covers `BUG-02`,
   `BUG-05`, `BUG-06`, `BUG-16`.
2. **Onboarding and profile.** Name validation, avatar cleanup, sign-out
   (`BUG-03`/`BUG-04`/`BUG-19`–`BUG-22`/`BUG-25`). These are the first-run path;
   nothing covers them yet.
3. **`SearchedTermSheet` and `BrightnessAdjuster`** (`BUG-26`–`BUG-28`).
4. **Component rendering.** The reminder settings sheet is the most complex UI
   in the app and has no render test.
5. **Persistence and migrations.** No test currently seeds a real on-disk schema
   and walks it forward, which is exactly where `BUG-01`, `BUG-29`, `BUG-31` and
   `BUG-32` live.

## 7. Manual-only checks

These cannot be asserted in Jest and must be run on a physical device or
emulator before a release. They are not yet written up as a signed-off
checklist.

- **Notification permission** — grant, deny, and "don't ask again"; the app must
  stay usable and must not prompt on launch.
- **OS scheduling** — the reminder fires at the configured time, survives an app
  kill, reboots, and a timezone change.
- **Tray dismissal** — dismissing the delivered reminder clears the badge and
  does not reschedule itself.
- **Cold start via notification tap** — routes to the right book and page.
- **EPUB fidelity** — real files paginate identically on iOS and Android;
  `BUG-11`/`BUG-12` are unprovable without real books.
- **Brightness** — the screen dims in dark mode and restores to system
  brightness on exit.
- **Haptics** — page-turn and milestone feedback fire on device.
- **Photo library** — first-time permission prompt, denial, and limited-access
  mode.
- **Backgrounding** — reading a book, backgrounding for minutes, and returning
  does not lose the session or corrupt progress.
