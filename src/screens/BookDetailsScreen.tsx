// import { fetchGoogleBookMetadata } from "@/api";
import { images } from '@/assets';
import { Book, Metadata } from '@/src/data/watermelondb/models';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavouriteButton } from '@/src/components';
import { withObservables } from '@nozbe/watermelondb/react';

const BookDetails = ({
  book,
  metadata,
}: {
  book: Book;
  metadata: Metadata;
}) => {
  const router = useRouter();

  const handleReadBook = () => {
    book?.updateLastRead();
    router.push({
      pathname: `/reader/[uri]`,
      params: { uri: book.uri },
    });
  };

  console.info('Progress ', book.progress);

  return (
    <SafeAreaView className="px-8 py-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Feather name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
          {book && <FavouriteButton book={book} />}
        </View>

        {/*  Image  */}
        <View className="mt-12 pb-4">
          <Animated.Image
            source={
              book.coverImage
                ? { uri: book.coverImage }
                : metadata?.coverImage
                  ? { uri: metadata?.coverImage }
                  : images.cover
            }
            resizeMode="cover"
            className="h-[370px] w-[250px] rounded-lg mx-auto shadow-lg"
          />
          <Text className="text-center mt-8 line-clamp-2 font-lato-bold text-3xl">
            {book?.title}
          </Text>
          {metadata?.subtitle && (
            <Text className="text-center mt-2 line-clamp-2 font-lato-regular text-lg text-app-taupe-grey-500 ">
              {metadata?.subtitle}
            </Text>
          )}
          <Text className="text-center mt-4 font-body text-xl text-secondary-100">
            {book?.author}
          </Text>
          {/*  progress indicator  */}
          {book && (
            <>
              <View className="w-7/12 h-[4px] rounded-full bg-slate-300 mx-auto mt-4">
                <Animated.View
                  className="bg-app-khaki-beige-700 h-1 rounded-full"
                  style={{ width: `${book.progress}%` }}
                ></Animated.View>
              </View>
              <Text className="text-center mt-2 text-typography-500">{`${book.progress}% completed`}</Text>
            </>
          )}
        </View>

        <View className="my-8">
          <TouchableOpacity
            className="mx-auto p-4 bg-app-golden-apricot-600 w-1/2 rounded-full "
            onPress={handleReadBook}
          >
            <View className="mx-auto">
              <View className="flex-row items justify-center gap-4">
                <Text className="text-white font-lato-bold text-xl">
                  Read Book
                </Text>
                <Feather name="book-open" size={24} color={'white'} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/*  Metadata  */}

        {metadata && (
          <View className="mb-20">
            <Text className="text-2xl mb-2 font-lato-bold">Summary</Text>
            <Text className="leading-8">{metadata.description}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// 2. The "Enhancer"
// This makes the component listen to the database.
const enhance = withObservables(['book'], ({ book }: { book: Book }) => ({
  book: book.observe(),
}));

export default enhance(BookDetails);

//
