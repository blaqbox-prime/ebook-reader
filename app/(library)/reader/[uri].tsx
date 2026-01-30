import { View, Text } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { Reader, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system'; // for Expo project
import { SafeAreaView } from 'react-native-safe-area-context';
const BookReader = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);

  // useEffect(() => {
  //   const fetchBook = async () => {
  //     try {
  //       const bookService = new BookService();
  //       const book = await bookService.getBookByUri(uri as string);
  //       setBook(book);
  //     } catch (error) {
  //       console.error('Error fetching book:', error);
  //     }
  //   };

  //   fetchBook();
  // }, []);

  return (
    <SafeAreaView className="flex flex-1 bg-white">
      <Reader
        src={uri as string}
        fileSystem={useFileSystem}
        flow="scrolled-continuous"
        onDisplayError={reason => {
          console.error(reason);
        }}
        onReady={(_, cl, p) => {
          console.info(cl, p);
        }}
        onStarted={() => {
          console.info('Loading Book');
        }}
      />
    </SafeAreaView>
  );
};

export default BookReader;
