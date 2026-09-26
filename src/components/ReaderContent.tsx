import LoadingPulse from '@/src/components/LoadingPulse';
import { Book } from '@/src/data/watermelondb/models';
import { useBookmarksStore, usePreferencesStore } from '@/src/store';
import { Reader, Location } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { getReaderTheme } from '@/src/utils/readerTheme';
import { getReaderFlow } from '@/src/utils/readerFlow';

export interface ReaderProgress {
  /** Index of the current location within the book, used as a pages-read proxy. */
  locationIndex: number;
  totalLocations: number;
  /** Whole-percent completion, 0-100. */
  progressPercent: number;
}

const PERIODIC_SAVE_INTERVAL_MS = 30_000;

const ReaderContent = ({
  book,
  uri,
  initialLocation,
  onProgressChange,
}: {
  book: Book | null;
  uri: string;
  initialLocation?: string;
  onProgressChange?: (progress: ReaderProgress) => void;
}) => {
  const router = useRouter();
  const { addBookmark, removeBookmark, getBookmarksByBookUri } =
    useBookmarksStore();
  const readerTheme = usePreferencesStore(state => state.readerTheme);
  const pageLayout = usePreferencesStore(state => state.pageLayout);
  const initialBookmarks = useMemo(
    () => getBookmarksByBookUri(uri),
    [getBookmarksByBookUri, uri]
  );
  // Use a Ref to keep track of location without re-rendering
  const locationRef = useRef<Location | null>(null);
  const totalLocationsRef = useRef<number>(0);

  const saveProgress = useCallback(async () => {
    const current = locationRef.current;
    const total = totalLocationsRef.current;

    if (book && current) {
      // WatermelonDB update
      await book.updateLastLocation(current.start.cfi);

      if (total > 0) {
        await book.updateProgress(
          Math.round((current.start.location / total) * 100)
        );
      }
    }
  }, [book]);

  // Report progress upward so the session layer can record pages read and
  // detect completion. Kept out of render state to avoid re-render churn.
  const reportProgress = useCallback(
    (totalLocations: number, current: Location) => {
      if (!onProgressChange || totalLocations <= 0) return;
      onProgressChange({
        locationIndex: current.start.location,
        totalLocations,
        progressPercent: Math.round(
          (current.start.location / totalLocations) * 100
        ),
      });
    },
    [onProgressChange]
  );

  useEffect(() => {
    // Save when user puts app in background
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        saveProgress();
      }
    });

    // Periodically persist so a crash or force-quit cannot discard a whole
    // chunk of reading; previously progress was only written on background.
    const interval = setInterval(saveProgress, PERIODIC_SAVE_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
      saveProgress(); // Save when user navigates away
    };
  }, [book, saveProgress]);

  if (!book) return <LoadingPulse />;

  return (
    <Reader
      src={uri}
      fileSystem={useFileSystem}
      initialLocation={initialLocation ?? book.lastLocation}
      initialBookmarks={initialBookmarks}
      onAddBookmark={bookmark => {
        addBookmark(bookmark, book.uri, book.title);
        Alert.alert('Bookmark Added', 'Your bookmark has been saved.');
      }}
      onRemoveBookmark={bookmark => {
        removeBookmark(bookmark);
        Alert.alert('Bookmark Removed', 'Your bookmark has been removed.');
      }}
      flow={getReaderFlow(pageLayout)}
      defaultTheme={getReaderTheme(readerTheme)}
      onLocationChange={(totalLocations, current, __) => {
        locationRef.current = current;
        totalLocationsRef.current = totalLocations;
        reportProgress(totalLocations, current);
      }}
      onDisplayError={reason => {
        Alert.alert('Failed To Open Book', reason);
        router.back();
      }}
    />
  );
};

export default ReaderContent;
