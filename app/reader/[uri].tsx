import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Book, ReadingSession } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { useReader } from '@epubjs-react-native/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReaderContent, ReaderOptionsFAB } from '@/src/components';
import { TOCActionSheet } from '@/src/components/TOCActionSheet';
import ReaderSettingsSheet from '@/src/components/ReaderSettingsSheet';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import { getNextReaderTheme } from '@/src/utils/readerTheme';

const BookReader = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [isTOCVisible, setTOCVisible] = useState(false);
  const [isReaderSettingsVisible, setReaderSettingsVisible] = useState(false);
  const reader = useReader();
  const sessionService = useRef(new SessionTrackingService());
  const sessionRef = useRef<ReadingSession | null>(null);
  // Theme handling
  const switchTheme = () => {
    reader.changeTheme(getNextReaderTheme(reader.theme));
  };
  const toggleToc = () => {
    setTOCVisible(prev => !prev);
  };

  const toggleReaderSettings = () => {
    setReaderSettingsVisible(prev => !prev);
  };

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
    };
    startSession();

    return () => {
      isMounted = false;
      currentSessionService.stopSession(sessionRef.current);
    };
  }, [uri]);

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
      <ReaderContent book={book} uri={uri as string} />
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
    </SafeAreaView>
  );
};

export default BookReader;
