import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const BookTileWide = ({
  book,
  showProgress = true,
}: {
  book: Book;
  showProgress: boolean;
}) => {
  const router = useRouter();

  const handleReadBook = () => {
    book?.updateLastRead();
    router.push({
      pathname: `/reader/[uri]`,
      params: { uri: book.uri },
    });
  };

  const progress = Math.round(book.progress);

  return (
    <View className="bg-m3-surface-low rounded-xl p-4 shadow-sm">
      <TouchableOpacity
        onPress={handleReadBook}
        className="flex-row gap-4 items-start"
      >
        <Image
          source={book.coverImage ? { uri: book.coverImage } : images.cover}
          resizeMode="cover"
          className="w-20 h-28 rounded-lg"
        />
        <View className="flex-1 min-w-0 h-28 justify-between">
          <View className="min-w-0">
            <Text
              numberOfLines={1}
              className="text-base leading-6 text-m3-on-surface font-bold"
            >
              {book.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5"
            >
              {book.author}
            </Text>
          </View>
          {showProgress && (
            <View className="flex-row items-center justify-between gap-2 pt-2">
              <View className="flex-1 min-w-0 mr-2">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[11px] leading-4 text-m3-outline">
                    Progress
                  </Text>
                  <Text className="text-[11px] leading-4 text-m3-primary font-bold">
                    {progress}%
                  </Text>
                </View>
                <View className="w-full bg-m3-secondary-container h-2 rounded-full overflow-hidden">
                  <View
                    className="bg-m3-primary h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleReadBook}
                className="h-10 px-4 rounded-full bg-m3-primary flex-row items-center justify-center gap-1 shadow-sm"
              >
                <MaterialIcons name="play-arrow" size={18} color="#ffffff" />
                <Text className="text-[14px] leading-5 text-m3-on-primary font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BookTileWide;
