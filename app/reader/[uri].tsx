import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { Themes, useReader } from '@epubjs-react-native/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReaderContent, ReaderOptionsFAB } from '@/src/components';
import { TOCActionSheet } from '@/src/components/TOCActionSheet';
import ReaderSettingsSheet from '@/src/components/ReaderSettingsSheet';

const THEMES = Object.values(Themes).slice(0, 2);

const BookReader = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [isTOCVisible, setTOCVisible] = useState(false);
  const [isReaderSettingsVisible, setReaderSettingsVisible] = useState(false);
  const reader = useReader();
  // Theme handling
  const switchTheme = () => {
    const index = Object.values(THEMES).indexOf(reader.theme);
    console.log(index);
    const nextTheme =
      Object.values(THEMES)[(index + 1) % Object.values(THEMES).length];

    reader.changeTheme(nextTheme);
  };
  const toggleToc = () => {
    setTOCVisible(prev => !prev);
  };

  const toggleReaderSettings = () => {
    setReaderSettingsVisible(prev => !prev);
  };

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
