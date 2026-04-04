import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import Animated from 'react-native-reanimated';
import { images } from '@/assets';
import { useRouter } from 'expo-router';
import BookTileWide from '@/src/components/BookTileWide';

const ContinueReadingList = () => {
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const bookService = new BookService();
      const books = await bookService.getBooksinProgress();
      setData(books);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <View className="mt-10">
      <Text className="font-body font-bold text-2xl mb-2">
        Currently Reading
      </Text>

      <Animated.FlatList
        data={data}
        renderItem={({ item }) => (
          <BookTileWide key={item.uri} book={item} showProgress={true} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
};

export default ContinueReadingList;
