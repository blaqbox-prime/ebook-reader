import { View, Text, Alert } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { Reader, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system'; // for Expo project
import { SafeAreaView } from 'react-native-safe-area-context';
const BookReader = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const router = useRouter();
  const { getCurrentLocation, getLocations } = useReader();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookService = new BookService();
        const book = await bookService.getBookByUri(uri as string);
        setBook(book);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };

    fetchBook();

    return () => {
      const handleBookClose = async () => {
        // update last reading position when component unmounts
        if (book) {
          const totalLocations = getLocations().length;
          const current = getCurrentLocation();
          book
            .updateLastLocation(current)
            .then(() => {
              console.log('last location updated');
            })
            .catch(error => {
              console.error('Error updating last location:', error);
            });
          // Update progress percentage
          if (current) {
            book.updateProgress(
              Math.round((current.start.location / totalLocations) * 100)
            );
          }
        }
      };
      handleBookClose();
    };
  }, [uri, getCurrentLocation]);

  return (
    <SafeAreaView className="flex flex-1 bg-white">
      <Reader
        src={uri as string}
        fileSystem={useFileSystem}
        flow="paginated"
        onDisplayError={reason => {
          Alert.alert('Failed To Open Book', reason);
          router.back();
        }}
      />
    </SafeAreaView>
  );
};

export default BookReader;
