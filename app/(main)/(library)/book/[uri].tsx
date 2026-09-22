import { LoadingPulse } from '@/src/components';
import { Book, Metadata } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import { BookDetailsScreen } from '@/src/screens';
import { Redirect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

const BookDetails = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book>();
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [readingNote, setReadingNote] = useState<string | undefined>(undefined);
  const navigator = useNavigation();

  useEffect(() => {
    let isMounted = true;
    const service = new BookService();
    const sessionService = new SessionTrackingService();
    const getBookDetails = async () => {
      try {
        const bookInfo = await service.getBookByUri(uri as string);
        if (bookInfo) {
          const [metadataInfo, sessions] = await Promise.all([
            service.getOrFetchMetadata(
              uri as string,
              bookInfo.title,
              bookInfo.author
            ),
            sessionService.getSessionsByBookUri(uri as string),
          ]);
          const latestNote = sessions
            ? [...sessions]
                .sort((a, b) => b.timeEnd.getTime() - a.timeEnd.getTime())
                .find(session => session.sessionNotes)
            : undefined;
          if (isMounted) {
            setBook(bookInfo);
            setMetadata(metadataInfo ?? null);
            setReadingNote(latestNote?.sessionNotes);
          }
        } else {
          // If no book found, navigate back to library
          console.warn(`No book found with URI: ${uri}`);
          navigator.goBack();
        }
      } catch (error) {
        console.error('Error loading book details:', error);
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
    <BookDetailsScreen
      book={book}
      metadata={metadata}
      readingNote={readingNote}
    />
  ) : (
    <Redirect href="/(main)" />
  );
};

export default BookDetails;
