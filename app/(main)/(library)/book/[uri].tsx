import { LoadingPulse } from '@/src/components';
import { Book, Metadata } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { BookDetailsScreen } from '@/src/screens';
import { Redirect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

const BookDetails = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book>();
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const navigator = useNavigation();

  useEffect(() => {
    let isMounted = true;
    const service = new BookService();
    const getBookDetails = async () => {
      try {
        const [bookInfo, metadataInfo] = await Promise.all([
          service.getBookByUri(uri as string),
          service.getMetadataByUri(uri as string),
        ]);
        if (bookInfo) {
          if (isMounted) {
            setBook(bookInfo);
            setMetadata(metadataInfo ?? null);
          }
        } else {
          // If no book found, navigate back to library
          console.warn(`No book found with URI: ${uri}`);
          navigator.goBack();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getBookDetails();
    return () => {
      isMounted = false;
    };
  }, [uri, navigator]);

  if (loading) return <LoadingPulse />;

  return book && !loading ? (
    <BookDetailsScreen book={book} metadata={metadata} />
  ) : (
    <Redirect href="/(main)" />
  );
};

export default BookDetails;
