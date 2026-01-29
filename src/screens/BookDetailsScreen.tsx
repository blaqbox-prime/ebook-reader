// import { fetchGoogleBookMetadata } from "@/api";
import { images } from '@/assets';
import { watermelondb } from '@/src/data';
import { Book } from '@/src/data/watermelondb/models';
import BookRepository from '@/src/repositories/BookRepository';
import MetadataRepository from '@/src/repositories/MetadataRepository';
// import { createNewMetadata, fetchBookByUri, fetchMetadataByUri } from "@/db/queries";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingPulse } from '@/src/components';

const BookDetails = ({ uri, cover }: { uri: string; cover: string }) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);
  const navigator = useNavigation();
  const bookRepository = new BookRepository(watermelondb);
  const metadataRepository = new MetadataRepository(watermelondb);

  useEffect(() => {
    const getBookDetails = async () => {
      let bookInfo = await bookRepository.fetchBookByUri(encodeURI(uri));
      if (bookInfo[0]) {
        setBook(bookInfo[0]);
        let metadataInfo = await metadataRepository.fetchMetadataByUri(
          encodeURI(uri)
        );
        if (metadataInfo[0]) {
          setMetadata(metadataInfo[0]);
        }
      } else {
        navigator.goBack();
      }
      setLoading(false);
    };

    getBookDetails();
  }, [uri]);

  const handleReadBook = () => {
    // book?.updateLastRead()
    // router.push({
    //     pathname: `/reader/[uri]`,
    //     params: {uri: uri as string}
    // })
  };

  if (loading) return <LoadingPulse />;

  return (
    <SafeAreaView className="px-8 py-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              navigator.goBack();
            }}
          >
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex flex-row items-center gap-4">
            <TouchableOpacity
              onPress={async () => {
                await book?.toggleIsFavourite();
              }}
            >
              {book?.isFavorite ? (
                <AntDesign name="star" size={24} color="gold" />
              ) : (
                <Feather name="star" size={24} color="black" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/*  Image  */}
        <View className="mt-12 pb-4">
          <Animated.Image
            source={
              cover
                ? { uri: cover }
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
                <View
                  className="bg-background-dark h-1 rounded-full"
                  style={{ width: `${book.progress}%` }}
                ></View>
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
export default BookDetails;
