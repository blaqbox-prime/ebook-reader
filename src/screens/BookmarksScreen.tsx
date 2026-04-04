import { Text } from 'react-native';
import React, { useEffect } from 'react';
import { Bookmark } from '@epubjs-react-native/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoritesList from '@/src/components/FavoritesList';
import { BookmarkList } from '@/src/components';
import BookmarkService from '@/src/services/BookmarkService';

const BookmarksScreen = () => {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  useEffect(() => {
    const service = new BookmarkService();
    // Load bookmarks from persistent storage
    const storedBookmarks = service.getBookmarks();
    if (storedBookmarks) {
      setBookmarks(storedBookmarks);
    }
  }, []);

  return (
    <SafeAreaView className=" bg-white px-6 py-4 flex-1">
      <FavoritesList containerClassName="mb-4" />
      <Text className="text-5xl font-heading w-3/4 mb-2">Bookmarks</Text>
      <BookmarkList bookmarks={bookmarks} />
    </SafeAreaView>
  );
};

export default BookmarksScreen;
