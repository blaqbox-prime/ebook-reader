import LoadingPulse from '@/src/components/LoadingPulse';
import { Book } from '@/src/data/watermelondb/models';
import { Reader, Themes } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';

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

  if (!book) return <LoadingPulse />;

  return (
    <Reader
      src={uri}
      fileSystem={useFileSystem}
      initialLocation={book.lastLocation}
      flow="paginated"
      defaultTheme={Themes.LIGHT}
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

export default ReaderContent;
