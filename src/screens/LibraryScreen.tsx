import { images } from '@/assets';
import {
  BookTile,
  EmptyStateView,
  LoadingPulse,
  SearchBox,
} from '@/src/components';
import { useLibraryStore } from '@/src/store';
import Feather from '@expo/vector-icons/Feather';
import { useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Library = () => {
  const {
    books,
    loading,
    refreshing,
    fetchBooks,
    searchBooks,
    addBooks,
    refreshBooks,
  } = useLibraryStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  if (loading) {
    return <LoadingPulse key={'pulse'} />;
  }

  return (
    <SafeAreaView className="flex flex-1 px-6 py-4 ">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-5xl font-lora">Library</Text>
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity onPress={addBooks}>
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
          ListHeaderComponent={<SearchBox onChangeText={searchBooks} />}
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
              buttonAction={addBooks}
            />
          }
          refreshing={refreshing}
          onRefresh={refreshBooks}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;
