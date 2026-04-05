import { Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoritesList from '@/src/components/FavoritesList';
import { BookmarkList } from '@/src/components';

const BookmarksScreen = () => {
  return (
    <SafeAreaView className=" bg-white px-6 py-4 flex-1">
      <FavoritesList containerClassName="mb-4" />
      <Text className="text-5xl font-heading w-3/4 mb-2">Bookmarks</Text>
      <BookmarkList />
    </SafeAreaView>
  );
};

export default BookmarksScreen;
