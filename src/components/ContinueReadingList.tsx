import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import BookTileWide from '@/src/components/BookTileWide';

const ContinueReadingList = () => {
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const nav = useNavigation();

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
  if (data.length === 0) return null;
  return (
    <View className="flex flex-col gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Text className="font-heading text-[22px] leading-7 text-m3-primary">
            Currently Reading
          </Text>
          <View className="w-2 h-2 rounded-full bg-m3-primary-container" />
        </View>
        <TouchableOpacity
          onPress={() => nav.navigate('(library)' as never)}
          className="flex-row items-center"
        >
          <Text className="text-[14px] leading-5 text-m3-primary font-semibold">
            See all
          </Text>
          <MaterialIcons name="chevron-right" size={16} color="#5c2d00" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-col gap-3">
        {data.map(book => (
          <BookTileWide key={book.uri} book={book} showProgress={true} />
        ))}
      </View>
    </View>
  );
};

export default ContinueReadingList;
