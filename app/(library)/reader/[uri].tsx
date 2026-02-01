import { View, Text, Alert, AppState } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { Reader, ReaderProvider, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookmarkButton } from '@/src/components';

// 1. Create an Inner Component to use the useReader hook
const ReaderContent = ({ book, uri }: { book: Book; uri: string }) => {
  const router = useRouter();
  // Use a Ref to keep track of location without re-rendering
  const locationRef = useRef<any>(null);
  const totalLocationsRef = useRef<number>(0);

  const saveProgress = async () => {
    const current = locationRef.current;
    const total = totalLocationsRef.current || 0;

    if (book && current) {
      // WatermelonDB update
      await book.updateLastLocation(current.start.cfi);

      if (total > 0) {
        const progress = Math.round((current.start.location / total) * 100);
        await book.updateProgress(progress);
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

  return (
    <Reader
      src={uri}
      fileSystem={useFileSystem}
      initialLocation={book.lastLocation}
      flow="paginated"
      onLocationChange={(_, current, __) => {
        locationRef.current = current;
      }}
      onLocationsReady={(_, locations) => {
        totalLocationsRef.current = locations.length;
      }}
      onDisplayError={reason => {
        Alert.alert('Failed To Open Book', reason);
        router.back();
      }}
    />
  );
};

const BookReader = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
  } = useReader();

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

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Bookmark handler
  const handleChangeBookmark = () => {
    const location = getCurrentLocation();

    if (!location) return;

    if (isBookmarked) {
      const bookmark = bookmarks.find(
        item =>
          item.location.start.cfi === location?.start.cfi &&
          item.location.end.cfi === location?.end.cfi
      );

      if (!bookmark) return;
      removeBookmark(bookmark);
    } else addBookmark(location);
  };

  return (
    <SafeAreaView className="flex flex-1 bg-white ">
      <ReaderContent book={book} uri={uri as string} />
      <View className="rounded-full aspect-square w-12 flex justify-center items-center bg-app-khaki-beige-200 absolute bottom-safe-offset-6 left-safe-offset-4">
        <BookmarkButton
          isBookmarked={isBookmarked}
          toggleBookmark={handleChangeBookmark}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookReader;
