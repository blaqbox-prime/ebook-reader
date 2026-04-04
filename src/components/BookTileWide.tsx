import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import { useRouter } from 'expo-router';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

const BookTileWide = ({
  book,
  showProgress = true,
}: {
  book: Book;
  showProgress: boolean;
}) => {
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
        <Text numberOfLines={1} className="font-heading text-gray-500">
          {book.author}
        </Text>
        {showProgress && (
          <>
            <View className="w-full h-[4px] rounded-full bg-slate-300 mt-6">
              <Animated.View
                className="bg-app-khaki-beige-700 h-1 rounded-full"
                style={{ width: `${book.progress}%` }}
              ></Animated.View>
            </View>
            <Text className="text-sm mt-2 text-app-khaki-beige-700">{`${book.progress}% completed`}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BookTileWide;
