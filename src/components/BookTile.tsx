import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
type BookTileProps = {
  book: Book;
};

const BookTile = ({ book }: BookTileProps) => {
  const [cover, _] = useState(book.coverImage);

  return (
    <Link
      href={{
        pathname: '/book/[uri]',
        params: { uri: book.uri, cover: cover },
      }}
      asChild
      key={book.uri}
    >
      <TouchableOpacity onPress={() => {}}>
        <View className="mb-4 w-full p-1">
          <Animated.Image
            source={cover ? { uri: cover as string } : images.cover}
            resizeMode="cover"
            className="h-[270px] w-full rounded-xl "
          />

          <View className="mt-6 px-4">
            <Text className="font-lato-black line-clamp-2 leading-snug tracking-wide">
              {book.title}
            </Text>
            <Text className="text-sm line-clamp-2 text-gray-600 leading-relaxed tracking-wide mt-2">
              {book.author}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default BookTile;
