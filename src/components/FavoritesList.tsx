import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import Animated from 'react-native-reanimated';
import BookTileWide from '@/src/components/BookTileWide';

const FavoritesList = ({
  containerClassName = '',
}: {
  containerClassName: string;
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const bookService = new BookService();
      const books = await bookService.getFavorites();
      setBooks(books);
      setLoading(false);
    };
    fetchData();
  }, []);

  return books.length === 0 && loading === false ? null : (
    <View className={`${containerClassName}`}>
      <Text className="text-5xl font-heading w-3/4 mb-2">Favourites</Text>
      <Animated.FlatList
        data={books}
        renderItem={({ item }) => (
          <BookTileWide key={item.uri} book={item} showProgress={false} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
};

export default FavoritesList;
