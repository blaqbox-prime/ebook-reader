import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type LibraryBookTileProps = {
  book: Book;
  onOptionsPress: (book: Book) => void;
};

const LibraryBookTile = ({ book, onOptionsPress }: LibraryBookTileProps) => {
  const progress = Math.round(book.progress);
  const finished = progress >= 100;
  const inProgress = progress > 0 && !finished;

  return (
    <View className="bg-m3-surface-low rounded-2xl p-2.5 shadow-sm">
      <Link
        href={{
          pathname: '/book/[uri]',
          params: { uri: book.uri, cover: book.coverImage },
        }}
        asChild
        key={book.uri}
      >
        <TouchableOpacity>
          <View className="relative w-full">
            <Image
              source={book.coverImage ? { uri: book.coverImage } : images.cover}
              resizeMode="cover"
              style={{ width: '100%', aspectRatio: 2 / 3 }}
              className="rounded-xl bg-m3-surface-container"
            />

            <TouchableOpacity
              onPress={() => onOptionsPress(book)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-m3-surface-lowest/90 items-center justify-center shadow-sm"
            >
              <MaterialIcons name="more-vert" size={18} color="#1b1c1a" />
            </TouchableOpacity>

            {finished && (
              <View className="absolute top-2 left-2 flex-row items-center gap-1 bg-m3-secondary px-2 py-0.5 rounded-full shadow-sm">
                <MaterialIcons name="verified" size={12} color="#ffffff" />
                <Text className="text-[11px] leading-4 text-m3-on-secondary">
                  Done
                </Text>
              </View>
            )}

            {inProgress && (
              <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-[#26221e]/85 px-2 py-0.5 rounded-full">
                <MaterialIcons name="auto-stories" size={12} color="#fdb37b" />
                <Text className="text-[11px] leading-4 text-white">
                  {book.lastLocation || 'In progress'}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-2.5">
            <Text
              numberOfLines={1}
              className="font-lato-black text-sm leading-5 text-m3-on-surface"
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

          {progress > 0 && (
            <View className="mt-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className={`text-[12px] leading-4 font-bold ${
                    finished ? 'text-m3-secondary' : 'text-m3-primary'
                  }`}
                >
                  {progress}%
                </Text>
                <View className="flex-row items-center gap-1">
                  {finished && (
                    <MaterialIcons name="done-all" size={14} color="#6e5c39" />
                  )}
                  <Text
                    className={`text-[11px] leading-4 ${
                      finished
                        ? 'text-m3-secondary'
                        : 'text-m3-on-surface-variant'
                    }`}
                  >
                    {finished ? 'Finished' : 'In Progress'}
                  </Text>
                </View>
              </View>
              <View className="w-full h-1.5 bg-m3-secondary-container rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${
                    finished ? 'bg-m3-secondary' : 'bg-m3-primary'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default LibraryBookTile;
