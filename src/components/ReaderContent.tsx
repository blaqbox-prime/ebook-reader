/* eslint-disable react-hooks/exhaustive-deps */
import LoadingPulse from '@/src/components/LoadingPulse';
import { preferencesStorage } from '@/src/data';
import { Book } from '@/src/data/watermelondb/models';
import BookmarkService from '@/src/services/BookmarkService';
import { Reader, Themes, Bookmark } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { useMMKV } from 'react-native-mmkv';

// 1. Create an Inner Component to use the useReader hook
const ReaderContent = ({ book, uri }: { book: Book | null; uri: string }) => {
  const router = useRouter();
  const preferences = useMMKV(preferencesStorage);
  // Use a Ref to keep track of location without re-rendering
  const locationRef = useRef<any>(null);
  const totalLocationsRef = useRef<number>(0);

  const saveProgress = async () => {
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
  };

  useEffect(() => {
    // Save when user puts app in background
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.match(/inactive|background/)) {
        saveProgress();
      }
    });

    return () => {
      subscription.remove();
      saveProgress(); // Save when user navigates away
    };
  }, [book]);

  if (!book) return <LoadingPulse />;

  return (
    <Reader
      src={uri}
      fileSystem={useFileSystem}
      initialLocation={book.lastLocation}
      onAddBookmark={bookmark => {
        const service = new BookmarkService();
        service.addBookmark(bookmark, book.uri);
        Alert.alert('Bookmark Added', 'Your bookmark has been saved.');
      }}
      onRemoveBookmark={bookmark => {
        const service = new BookmarkService();
        service.removeBookmark(bookmark);
        Alert.alert('Bookmark Removed', 'Your bookmark has been removed.');
      }}
      flow="scrolled-doc"
      defaultTheme={Themes.LIGHT}
      onLocationChange={(totalLocations, current, __) => {
        locationRef.current = current;
        totalLocationsRef.current = totalLocations;
      }}
      onDisplayError={reason => {
        Alert.alert('Failed To Open Book', reason);
        router.back();
      }}
    />
  );
};

export default ReaderContent;
