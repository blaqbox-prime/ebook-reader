import { colors } from '@/constants/constants';
import { useLibraryStore } from '@/lib/libraryStore';
import { ReaderProvider, useReader } from '@epubjs-react-native/core';
import { Link } from 'expo-router';
import React from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { PulseIndicator } from 'react-native-indicators';
import { SafeAreaView } from 'react-native-safe-area-context';

const library = () => {
  const {
    books,
    isLoading,
    isScanning,
    loadCachedData,
    handleSelectBooks,
    scanAppDirectoryForBooks,
    handleClearLibrary,
    removeBook
  } = useLibraryStore();

  const reader = useReader();

  // // Load cached data on component mount
  // useEffect(() => {
  //   scanAppDirectoryForBooks;
  // }, []);

  if (isLoading || isScanning) {
    return (
      <SafeAreaView className="flex flex-1 items-center justify-center gap-4">
        <View>
          <PulseIndicator color={colors.primary} />
          <Text className='text-primary'>Loading Library</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <ReaderProvider>

    <SafeAreaView className="flex flex-1 px-8 py-6">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-3xl font-lato-bold">Library</Text>
        <TouchableOpacity onPress={handleSelectBooks}>
          <Text className="text-primary">Add books</Text>
        </TouchableOpacity>
      </View>

    <View className='flex flex-col flex-1 mt-6'>
        <Animated.FlatList
        data={books}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(bookfile) => bookfile.uri}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          
          return (
            <TouchableOpacity className="w-[48%] mb-6">
              <Link
                href={{ pathname: '/reader/[uri]', params: { uri: item.uri } }}
                asChild
              >
                <View className='mb-4 w-full p-2'>
                  <Image source={{uri: item.coverImage as string}}
                  resizeMode='cover'
                  className='h-[290px] w-full bg-slate-400 rounded-3xl shadow-lg shadow-slate-400'
                />

                <View className='mt-6 px-4'>
                  <Text className='font-lato-black line-clamp-2 leading-snug tracking-wide'>{item.title}</Text>
                <Text className='text-sm line-clamp-1 text-gray-600 leading-relaxed tracking-wide mt-2'>{item.author}</Text>
                </View>
                </View>

              </Link>
            </TouchableOpacity>
          );
        }}
      /> 
    </View>
    
    </SafeAreaView>
    </ReaderProvider>
  );
};

export default library;