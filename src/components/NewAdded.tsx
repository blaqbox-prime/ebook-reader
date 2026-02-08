import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import BookTile from '@/src/components/BookTile';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';

const NewAdded = () => {
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const bookService = new BookService();
      const books = await bookService.getNewlyAddedBooks();
      setData(books.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <View className="my-10">
      <Text className="font-body font-bold text-2xl mb-2">Newly Added</Text>

      <Animated.FlatList
        data={data}
        renderItem={({ item }) => (
          <View className="w-[200px] p-2">
            <BookTile key={item.uri} book={item} />
          </View>
        )}
        horizontal
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
};

export default NewAdded;
