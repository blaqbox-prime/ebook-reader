import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Book, ReadingSession } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { useReader } from '@epubjs-react-native/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AchievementUnlockModal,
  ReaderContent,
  ReaderOptionsFAB,
  ReaderProgress,
} from '@/src/components';
import { TOCActionSheet } from '@/src/components/TOCActionSheet';
import ReaderSettingsSheet from '@/src/components/ReaderSettingsSheet';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import { toggleReaderTheme } from '@/src/utils/readerTheme';
import { useAchievementStore, usePreferencesStore } from '@/src/store';
import { AppState } from 'react-native';

/** Minimum gap between session page-count writes while scrolling. */
const SESSION_WRITE_THROTTLE_MS = 5_000;

const BookReader = () => {
  const { uri, location } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [isTOCVisible, setTOCVisible] = useState(false);
  const [isReaderSettingsVisible, setReaderSettingsVisible] = useState(false);
  const reader = useReader();
  const sessionService = useRef(new SessionTrackingService());
  const sessionRef = useRef<ReadingSession | null>(null);
  const readerTheme = usePreferencesStore(state => state.readerTheme);
  const setReaderTheme = usePreferencesStore(state => state.setReaderTheme);
  const processReadingSession = useAchievementStore(
    state => state.processReadingSession
  );
  const newlyUnlockedAchievements = useAchievementStore(
    state => state.newlyUnlockedAchievements
  );
  const clearNewlyUnlocked = useAchievementStore(
    state => state.clearNewlyUnlocked
  );

  // Latches kept in refs so recording progress never re-renders the reader.
  const wasCompletedRef = useRef(false);
  // Held in a ref, not state: the session effect must run exactly once per book.
  // Depending on `book` would tear down and recreate the session the moment the
  // record finished loading, splitting one read into two sessions.
  const bookRef = useRef<Book | null>(null);
  bookRef.current = book;
  const latestPageRef = useRef<number | null>(null);
  const lastPagesWriteRef = useRef(0);
  // Page the reader was on when this session opened. `null` until the first
  // progress report arrives, which doubles as "session not really started".
  const sessionStartPageRef = useRef<number | null>(null);

  /**
   * Pages advanced since this session opened, clamped at zero so jumping
   * backwards (TOC, a bookmark) never records negative progress.
   */
  const getPagesReadDelta = useCallback(() => {
    const currentPage = latestPageRef.current;
    if (currentPage == null) return 0;
    if (sessionStartPageRef.current == null) {
      sessionStartPageRef.current = currentPage;
      return 0;
    }
    return Math.max(0, currentPage - sessionStartPageRef.current);
  }, []);

  // Theme handling — the preference is persisted, so the reader reopens in the
  // tone the reader last chose instead of always resetting to light.
  const switchTheme = () => {
    setReaderTheme(toggleReaderTheme(readerTheme));
  };
  const toggleToc = () => {
    setTOCVisible(prev => !prev);
  };

  const toggleReaderSettings = () => {
    setReaderSettingsVisible(prev => !prev);
  };

  const handleProgressChange = useCallback(
    async (progress: ReaderProgress) => {
      latestPageRef.current = progress.page;
      const session = sessionRef.current;
      if (!session) return;

      // Latch completion: only the first crossing of 100% counts as a finished
      // book, so scrubbing back and forth cannot inflate the total.
      if (progress.progressPercent >= 100 && !wasCompletedRef.current) {
        wasCompletedRef.current = true;
        try {
          await session.updateBookCompleted(true);
        } catch (error) {
          console.error('Error recording book completion:', error);
        }
      }

      // Record how far the reader actually advanced this session. Storing the
      // absolute page instead would add the whole book-prefix to the lifetime
      // total on every resume, inflating the page achievements without the
      // reader having read anything.
      const pagesRead = getPagesReadDelta();

      // Throttled because location changes arrive far more often than they are
      // worth persisting. The final value is flushed on unmount.
      const now = Date.now();
      if (now - lastPagesWriteRef.current < SESSION_WRITE_THROTTLE_MS) return;
      lastPagesWriteRef.current = now;

      try {
        await session.updatePagesRead(pagesRead);
      } catch (error) {
        console.error('Error recording pages read:', error);
      }
    },
    [getPagesReadDelta]
  );

  useEffect(() => {
    let isMounted = true;

    const currentSessionService = sessionService.current;

    const startSession = async () => {
      if (!uri) return;
      const newSession = await currentSessionService.createSession(
        uri as string,
        new Date()
      );
      if (!isMounted) return;
      sessionRef.current = newSession;

      // Stamp the first open so the speed achievements have a start date. This
      // is write-once on the model and does not reset on later opens.
      try {
        const foundBook = await new BookService().getBookByUri(uri as string);
        if (foundBook) {
          await foundBook.markFirstOpened();
        }
      } catch (error) {
        console.error('Error stamping first open:', error);
      }
    };
    startSession();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        // Close the in-flight session on background so a force-quit later can
        // be repaired from a real timestamp instead of losing the time.
        void currentSessionService.stampSession(sessionRef.current);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
      void (async () => {
        // Flush the final page count before the session is read back, otherwise
        // the throttled write discards whatever was read since the last tick.
        const session = sessionRef.current;
        if (session) {
          try {
            await session.updatePagesRead(getPagesReadDelta());
          } catch (error) {
            console.error('Error recording final page count:', error);
          }
        }

        const stopped = await currentSessionService.stopSession(
          sessionRef.current
        );
        if (!stopped) return;
        try {
          const minutesReadToday =
            await currentSessionService.getTotalDurationTodayInMinutes();
          const daysSinceFirstOpen =
            bookRef.current?.getDaysSinceFirstOpened() ?? null;
          await processReadingSession(stopped, {
            minutesReadToday,
            fastestCompletionDays: wasCompletedRef.current
              ? daysSinceFirstOpen
              : null,
          });
        } catch (error) {
          console.error('Error processing reading session:', error);
        }
      })();
    };
  }, [uri, processReadingSession, getPagesReadDelta]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookService = new BookService();
        const foundBook = await bookService.getBookByUri(uri as string);
        setBook(foundBook);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };
    fetchBook();
  }, [uri]);

  return (
    <SafeAreaView
      className="flex flex-1 bg-white"
      style={{ backgroundColor: reader.theme.body.background }}
    >
      <ReaderContent
        book={book}
        uri={uri as string}
        initialLocation={Array.isArray(location) ? location[0] : location}
        onProgressChange={handleProgressChange}
      />
      <ReaderOptionsFAB
        showFab={true}
        reader={reader}
        toggleToc={toggleToc}
        switchTheme={switchTheme}
        toggleReaderSettings={toggleReaderSettings}
      />
      <TOCActionSheet
        handleClose={() => {
          setTOCVisible(false);
        }}
        isOpen={isTOCVisible}
        toc={reader.toc}
        reader={reader}
      />
      <ReaderSettingsSheet
        handleClose={() => {
          setReaderSettingsVisible(false);
        }}
        isOpen={isReaderSettingsVisible}
        reader={reader}
      />
      <AchievementUnlockModal
        achievements={newlyUnlockedAchievements}
        onClose={clearNewlyUnlocked}
      />
    </SafeAreaView>
  );
};

export default BookReader;
