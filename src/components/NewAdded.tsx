import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
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
  if (data.length === 0) return null;
  return (
    <View className="flex flex-col">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-heading text-[22px] leading-7 text-m3-primary">
          Newly Added
        </Text>
        <Text className="text-[12px] leading-4 text-m3-outline">
          {data.length} books
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={{ width: 128 }}>
            <BookTile
              key={item.uri}
              book={item}
              coverWidth={128}
              coverHeight={192}
              showFormatBadge={true}
            />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
      />
    </View>
  );
};

export default NewAdded;
