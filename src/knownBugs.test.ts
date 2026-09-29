/**
 * Central registry of known defects found while building the test suite.
 *
 * Policy: tests assert the CORRECT behaviour. Anything currently wrong is
 * recorded here as `it.todo`, so the suite stays green and mergeable while
 * nothing broken is silently blessed. When a bug is fixed, delete its `it.todo`
 * and turn the `it` body into a real assertion.
 *
 * Every entry must name the file/line it was observed in, so the next person
 * can act on it without re-deriving the investigation.
 */

describe('known-bug registry', () => {
  describe('BUG-01 session recovery is dead code (critical, data loss)', () => {
    it.todo(
      'reading_sessions.time_end_at is declared non-optional in schema.js:48 but written as null in SessionRepository.ts:45; WatermelonDB coerces it to 0, so Q.where("time_end_at", null) matches nothing and orphan rows report a huge negative duration. Needs schema v10 with isOptional:true plus a migration. See SessionRepository.test.ts.'
    );
  });

  describe('BUG-02 deleting a book leaves the file on disk', () => {
    it.todo(
      'removeBook deletes the WatermelonDB row but not the .epub file, so the next library scan re-imports the "deleted" book. See LibraryScreen delete flow.'
    );
  });

  describe('BUG-03 sign-out does not clear reading sessions', () => {
    it.todo(
      'handleSignOut clears bookmarks, achievements, preferences, profile and avatar but not reading_sessions, so "Total Reading" survives while XP and streak reset. See profile/index.tsx.'
    );
  });

  describe('BUG-04 sign-out silently re-enables the daily reminder', () => {
    it.todo(
      'resetPreferences() restores reminderEnabled:true, so signing out turns the reminder back on without the user asking.'
    );
  });

  describe('BUG-05 one corrupt EPUB aborts the whole import', () => {
    it.todo(
      'BookScanner uses Promise.all with no per-file try/catch, so a single malformed file rejects the batch and nothing is imported.'
    );
  });

  describe('BUG-06 duplicate import throws instead of skipping', () => {
    it.todo(
      'Duplicate detection matches on exact URI only, so the same book under a different filename is re-imported and the uniqueness constraint throws, killing the batch.'
    );
  });

  describe('BUG-07 book details errors redirect to Home', () => {
    it.todo(
      'Any error in BookDetailsScreen redirects to the Home tab rather than showing an error state. See bookDetailsScreen error path.'
    );
  });

  describe('BUG-08 theme toggle does not apply live', () => {
    it.todo(
      'Toggling the reader theme flips the setting label but the rendered book keeps the previous theme until remount. See ReaderSettingsSheet / ReaderContent.'
    );
  });

  describe('BUG-09 book completions can be double counted', () => {
    it.todo(
      'totalBooksCompleted uses a per-mount milestone latch, so re-entering a finished book can increment again. See achievementStore.test.ts.'
    );
  });

  describe('BUG-10 backwards scroll shrinks the pages-read delta', () => {
    it.todo(
      'A backwards jump produces a negative delta which is then discarded, so a reader who scrolls back and forward again is not credited for the pages. See ReaderContent progress tracking.'
    );
  });

  describe('BUG-11 forward jumps inflate pages read', () => {
    it.todo(
      'A large forward jump credits every page it skipped, letting one scroll to the end of a book farm the page achievements.'
    );
  });

  describe('BUG-12 pages are counted on two different scales', () => {
    it.todo(
      'Printed page counts and location/1600-derived counts are both fed into the same total, so high page achievements are unreachable or trivially crossed depending on the book.'
    );
  });

  describe('BUG-13 Manage EPUB Storage is a stub', () => {
    it.todo(
      'The settings row is present but does nothing. See profile/index.tsx.'
    );
  });

  describe('BUG-14 four settings rows are dead ends', () => {
    it.todo(
      'Rows for storage, appearance, reading goals and about are non-functional; each should either work or be visibly disabled.'
    );
  });

  describe('BUG-15 SessionRow is wired to the storage handler', () => {
    it.todo(
      'SessionRow.onPress calls handleStorage rather than opening the session.'
    );
  });

  describe('BUG-16 empty-filter state shows the wrong message', () => {
    it.todo(
      'A search or filter matching nothing shows the "No books yet" empty state instead of "No books match your search".'
    );
  });

  describe('BUG-17 streak banner shows active at zero', () => {
    it.todo(
      'The "Reading Streak Active" banner renders even when currentStreak is 0.'
    );
  });

  describe('BUG-18 0% progress renders as "Page 1 of N"', () => {
    it.todo(
      'computeCurrentPage clamps to a minimum of 1. See bookDetailsUtils.test.ts.'
    );
  });

  describe('BUG-19 onboarding step 3 "Skip" does not skip', () => {
    it.todo(
      'The Skip control is present but the form still requires a display name.'
    );
  });

  describe('BUG-20 display name validation is too permissive', () => {
    it.todo(
      'Zero-width characters pass validation, and the 50-character maxLength does not truncate an already-loaded over-long value.'
    );
  });

  describe('BUG-21 replayed onboarding orphans the avatar', () => {
    it.todo(
      'Replaying onboarding resets progress but leaves the previous avatar file on disk.'
    );
  });

  describe('BUG-22 photo-library denial is indistinguishable from cancel', () => {
    it.todo(
      'An iOS permission denial and a user cancel both resolve to canceled:true.'
    );
  });

  describe('BUG-23 XP card math is inconsistent', () => {
    it.todo(
      'readerLevel.ts:61 returns xpForCurrentLevel as the lifetime total rather than XP earned within the current level, so the card disagrees with its own progress bar.'
    );
  });

  describe('BUG-24 reminder copy contradicts its trigger condition', () => {
    it.todo(
      'The sheet says the reminder arrives "once you hit your daily goal" but app/_layout passes todayMinutesRead > 0, so any reading at all cancels the reminder.'
    );
  });

  describe('BUG-25 sign-out is a no-op on web', () => {
    it.todo(
      'Alert.alert is unimplemented on web, so the confirm never resolves and nothing is cleared.'
    );
  });

  describe('BUG-26 search results accumulate', () => {
    it.todo('SearchedTermSheet appends new results instead of replacing them.');
  });

  describe('BUG-27 repeated searches reuse a stateful /g regex', () => {
    it.todo(
      'A global-flagged RegExp retains lastIndex across calls, so searching the same term twice returns different results.'
    );
  });

  describe('BUG-28 brightness control is not persisted', () => {
    it.todo(
      'BrightnessAdjuster re-requests permission on every tick, never persists the value, and never restores system brightness on exit.'
    );
  });

  describe('BUG-29 migrations 1-6 are missing', () => {
    it.todo(
      'migrations.js only defines toVersion 7, 8 and 9, so an install already on schema 5 or lower cannot upgrade at all. Fix alongside BUG-01.'
    );
  });

  describe('BUG-30 corrupt bookmarks crash the app on construction', () => {
    it.todo(
      'BookmarkService JSON.parses the stored payload in its constructor with no guard. See BookmarkService.test.ts.'
    );
  });

  describe('BUG-31 no index migrations', () => {
    it.todo(
      'books.uri, metadata.book_uri and reading_sessions.book_uri are declared isIndexed but no migration creates the indexes on existing installs.'
    );
  });

  describe('BUG-32 Metadata.categories round-trips an array through a scalar column', () => {
    it.todo(
      'The schema declares categories as type "string" with no @json decorator, so an array is silently stringified. See schema.js:35.'
    );
  });

  describe('BUG-33 env.ts throws at module load', () => {
    it.todo(
      'A missing API key throws while the module is imported, not when the feature is used.'
    );
  });

  describe('BUG-34 APP_VERSION is duplicated', () => {
    it.todo(
      'A hardcoded version string can drift from app.json; it should be read from the manifest.'
    );
  });

  describe('BUG-35 the achievements table is dead weight', () => {
    it.todo(
      'The achievements table is declared in schema.js:57-65 and retained so installs do not need a destructive migration, but no model is registered and nothing reads it.'
    );
  });

  describe('BUG-36 changing the reminder time leaves a duplicate schedule', () => {
    it.todo(
      'refreshDailyReminder clears the stored id before delegating, so the inner cancel no-ops and the old OS trigger is orphaned. See NotificationsService.test.ts.'
    );
  });
});
