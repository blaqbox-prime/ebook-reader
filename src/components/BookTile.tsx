import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

type BookTileProps = {
  book: Book;
  coverWidth?: number;
  coverHeight?: number;
  showFormatBadge?: boolean;
};

const BookTile = ({
  book,
  coverWidth,
  coverHeight,
  showFormatBadge = false,
}: BookTileProps) => {
  const cover = book.coverImage;
  const isCompact = Boolean(coverWidth && coverHeight);

  return (
    <Link
      href={{
        pathname: '/book/[uri]',
        params: { uri: book.uri, cover: cover },
      }}
      asChild
      key={book.uri}
    >
      <TouchableOpacity>
        <View className="mb-4 w-full p-1">
          <View className="relative">
            <Animated.Image
              source={cover ? { uri: cover as string } : images.cover}
              resizeMode="cover"
              style={
                isCompact ? { width: coverWidth, height: coverHeight } : {}
              }
              className={
                isCompact ? 'rounded-xl' : 'h-[270px] w-full rounded-xl'
              }
            />
            {showFormatBadge && (
              <View className="absolute top-2 right-2 bg-m3-surface-lowest/80 px-1.5 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-m3-primary">
                  EPUB
                </Text>
              </View>
            )}
          </View>

          <View className={isCompact ? 'mt-2 px-1' : 'mt-6 px-4'}>
            <Text
              numberOfLines={isCompact ? 1 : 2}
              className={
                isCompact
                  ? 'font-lato-black text-sm text-m3-on-surface leading-5 tracking-wide'
                  : 'font-lato-black line-clamp-2 leading-snug tracking-wide'
              }
            >
              {book.title}
            </Text>
            <Text
              numberOfLines={isCompact ? 1 : 2}
              className={
                isCompact
                  ? 'text-[12px] text-m3-on-surface-variant leading-4 mt-1'
                  : 'text-sm line-clamp-2 text-gray-600 leading-relaxed tracking-wide mt-2'
              }
            >
              {book.author}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default BookTile;
