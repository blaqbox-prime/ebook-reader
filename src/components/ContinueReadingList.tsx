import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import Animated from 'react-native-reanimated';
import { images } from '@/assets';
import { useRouter } from 'expo-router';

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
    <View className="my-6">
      <Text className="font-body font-semibold text-3xl mb-2">
        Continue Reading
      </Text>

      <Animated.FlatList
        data={data}
        renderItem={({ item }) => <Item key={item.uri} book={item} />}
        horizontal
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
};

export default ContinueReadingList;

const Item = ({ book }: { book: Book }) => {
  const { width } = Dimensions.get('screen');
  const _width = width * 0.79;
  const router = useRouter();

  const handleReadBook = () => {
    book?.updateLastRead();
    router.push({
      pathname: `/reader/[uri]`,
      params: { uri: book.uri },
    });
  };

  return (
    <TouchableOpacity
      onPress={handleReadBook}
      className="flex-row gap-4 p-4  rounded-2xl border-2 border-gray-50"
      style={{ height: 150, width: _width }}
    >
      <Image
        source={book.coverImage ? { uri: book.coverImage } : images.cover}
        resizeMode="cover"
        className={`h-[120px] w-[100px] rounded-xl`}
      />
      <View className="w-1/2 py-2">
        <Text numberOfLines={2} className="font-body font-bold text-xl">
          {book.title}
        </Text>
        <Text numberOfLines={1} className="font-body text-gray-500">
          {book.author}
        </Text>
        <View className="w-full h-[4px] rounded-full bg-slate-300 mt-6">
          <Animated.View
            className="bg-app-khaki-beige-700 h-1 rounded-full"
            style={{ width: `${book.progress}%` }}
          ></Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
