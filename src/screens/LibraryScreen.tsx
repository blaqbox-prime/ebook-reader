import { images } from '@/assets';
import {
  BookTile,
  EmptyStateView,
  LoadingPulse,
  SearchBox,
} from '@/src/components';
import watermelondb from '@/src/data/watermelondb';
import { Book } from '@/src/data/watermelondb/models';
import BookRepository from '@/src/repositories/BookRepository';
import BookService from '@/src/services/BookService';
import { BookScanner } from '@/src/utils';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllBooks = async () => {
    setLoading(true);

    try {
      const repo = new BookRepository(watermelondb);
      const dbBooks = await repo.getAllBooks();
      setBooks(dbBooks);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to fetch books from database.');
    }
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    if (text.trim().length > 0) {
      const filteredBooks = books.filter(
        book =>
          book.title.toLowerCase().includes(text.toLowerCase()) ||
          book.author.toLowerCase().includes(text.toLowerCase())
      );
      setBooks(filteredBooks);
    } else {
      // If search text is empty, fetch all books again
      fetchAllBooks();
    }
  };

  const handleAddBooks = async () => {
    const booksScanner = new BookScanner();
    const bookService = new BookService();
    const addedBooks = await booksScanner.AddBooksFromFileStorage();
    await bookService.saveScannedBooksWithMetadata(addedBooks);
    fetchAllBooks();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (BookScanner.BOOKS_DIR.list().length === 0) {
      Alert.alert('No books found', 'Please add books to your library.');
      setRefreshing(false);
      return;
    }
    const bookService = new BookService();
    const booksScanner = new BookScanner();

    const scannedBooks = await booksScanner.scanAppDirectory();
    await bookService.saveScannedBooksWithMetadata(scannedBooks);
    await fetchAllBooks();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  if (loading) {
    return <LoadingPulse key={'pulse'} />;
  }

  return (
    <SafeAreaView className="flex flex-1 px-6 py-3 bg-app-khaki-beige-50">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-3xl font-lora">Library</Text>
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity onPress={handleAddBooks}>
            <Text className="text-primary">Add books</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex flex-col flex-1 mt-6">
        <Animated.FlatList
          data={books}
          extraData={books}
          numColumns={2}
          horizontal={false}
          keyExtractor={bookfile => bookfile.uri}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return (
              <View className="w-1/2 p-2">
                <BookTile key={item.uri} book={item} />
              </View>
            );
          }}
          ListHeaderComponent={<SearchBox onChangeText={handleSearch} />}
          ListHeaderComponentStyle={{
            marginBottom: 24,
          }}
          ListFooterComponent={<View className="h-20"></View>}
          ListEmptyComponent={
            <EmptyStateView
              image={images.bookshelf}
              message={'No books available.'}
              showButton={true}
              buttonText={'Add Books'}
              buttonIcon={<Feather name={'plus'} size={24} color="white" />}
              buttonAction={handleAddBooks}
            />
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;
