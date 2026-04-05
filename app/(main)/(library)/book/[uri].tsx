import { LoadingPulse } from '@/src/components';
import { watermelondb } from '@/src/data';
import { Book } from '@/src/data/watermelondb/models';
import { BookRepository, MetadataRepository } from '@/src/repositories';
import { BookDetailsScreen } from '@/src/screens';
import {
  Redirect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { useEffect, useState } from 'react';

const BookDetails = () => {
  const { uri } = useLocalSearchParams();
  const [book, setBook] = useState<Book>();
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);
  const navigator = useNavigation();
  const bookRepository = new BookRepository(watermelondb);
  const metadataRepository = new MetadataRepository(watermelondb);

  useEffect(() => {
    const getBookDetails = async () => {
      let bookInfo = await bookRepository.fetchBookByUri(uri as string);
      if (bookInfo[0]) {
        setBook(bookInfo[0]);
        let metadataInfo = await metadataRepository.fetchMetadataByUri(
          uri as string
        );
        if (metadataInfo[0]) {
          setMetadata(metadataInfo[0]);
        }
      } else {
        // If no book found, navigate back to library
        console.warn(`No book found with URI: ${uri}`);
        navigator.goBack();
      }
      setLoading(false);
    };

    getBookDetails();
  }, [uri]);

  if (loading) return <LoadingPulse />;

  return book && !loading ? (
    <BookDetailsScreen book={book} metadata={metadata} />
  ) : (
    <Redirect href="/(main)" />
  );
};

export default BookDetails;
