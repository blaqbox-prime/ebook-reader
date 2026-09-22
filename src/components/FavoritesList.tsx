import { images } from '@/assets';
import { Book } from '@/src/data/watermelondb/models';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

const FavoriteCard = ({
  book,
  onContinue,
}: {
  book: Book;
  onContinue: (book: Book) => void;
}) => {
  return (
    <View className="w-44 bg-m3-surface-low rounded-xl p-3 flex-col shadow-sm">
      <TouchableOpacity
        onPress={() => onContinue(book)}
        className="w-full h-44 rounded-lg overflow-hidden mb-2.5 bg-m3-surface-highest shadow-sm"
      >
        <Image
          source={book.coverImage ? { uri: book.coverImage } : images.cover}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-2 right-2 bg-m3-surface-highest/90 p-1 rounded-full">
          <MaterialIcons name="favorite" size={16} color="#ba1a1a" />
        </View>
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        className="text-[14px] leading-5 text-m3-on-surface font-bold"
      >
        {book.title}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[12px] leading-4 text-m3-on-surface-variant mb-3"
      >
        {book.author}
      </Text>
      <TouchableOpacity
        onPress={() => onContinue(book)}
        className="mt-auto flex-row items-center justify-center gap-1 bg-m3-secondary-container px-3 py-1.5 rounded-full shadow-sm"
      >
        <MaterialIcons name="play-arrow" size={16} color="#554424" />
        <Text className="text-[11px] leading-4 font-semibold text-m3-on-secondary-container">
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const FavoritesList = ({
  books,
  containerClassName = '',
}: {
  books: Book[];
  containerClassName?: string;
}) => {
  const router = useRouter();

  if (books.length === 0) return null;

  const handleContinue = (book: Book) => {
    void book.updateLastRead();
    router.push({
      pathname: '/reader/[uri]',
      params: { uri: book.uri },
    });
  };

  return (
    <View className={containerClassName}>
      <FlatList
        data={books}
        horizontal
        keyExtractor={book => book.uri}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 24 }}
        renderItem={({ item }) => (
          <FavoriteCard book={item} onContinue={handleContinue} />
        )}
      />
    </View>
  );
};

export default FavoritesList;
