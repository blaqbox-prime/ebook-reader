import { BookDetailsScreen } from '@/src/screens';
import { useLocalSearchParams } from 'expo-router';

const BookDetails = () => {
  const { uri, cover } = useLocalSearchParams();

  return <BookDetailsScreen uri={uri as string} cover={cover as string} />;
};

export default BookDetails;
