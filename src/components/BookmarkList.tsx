import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { use, useEffect } from 'react';
import { Bookmark } from '@epubjs-react-native/core';
import Fontisto from '@expo/vector-icons/Fontisto';
import { colors } from '@/src/constants';
import { useBookmarksStore } from '@/src/store';
import Animated from 'react-native-reanimated';
import EmptyStateView from '@/src/components/EmptyStateView';
import { images } from '@/assets';

type BookmarkListProps = {
  bookmarks: Bookmark[];
};

const BookmarkList = () => {
  // const [items, setItems] = React.useState<Bookmark[]>(bookmarks);
  const { bookmarks, loadBookmarks, removeBookmark } = useBookmarksStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
    setRefreshing(false);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        {
          text: 'DELETE',
          onPress: () => {
            removeBookmark(bookmark);
            Alert.alert('Bookmark Deleted', 'The bookmark has been deleted.');
          },
          style: 'destructive',
        },
        {
          text: 'CANCEL',
          onPress: () => {
            Alert.alert('Cancelled', 'Bookmark deletion cancelled.');
          },
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Animated.FlatList
      className="mt-8"
      data={bookmarks}
      extraData={bookmarks}
      keyExtractor={bookmark => `${bookmark.id}`}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => (
        <View className="border-b border-gray-200"></View>
      )}
      ListEmptyComponent={
        <EmptyStateView
          image={images.bookshelf}
          message={'No bookmarks available.'}
          showButton={false}
        />
      }
      refreshing={refreshing}
      onRefresh={handleRefresh}
      renderItem={({ item }: { item: any }) => {
        return (
          <View className="px-4 py-2 flex-row gap-4 items-center">
            <TouchableOpacity className="flex-1">
              <View>
                <Text className="text-lg font-semibold mb-1 line-clamp-2">
                  {item.bookTitle.trim() || 'Untitled'}
                </Text>
                <Text className="text-secondary-500 font-semibold mb-2 line-clamp-2">
                  {item.text.trim() || 'No bookmark text'}
                </Text>
              </View>
            </TouchableOpacity>
            <View className="w-14 bg-blue h-full flex items-center justify-center">
              <TouchableOpacity onPress={() => handleDeleteBookmark(item)}>
                <Fontisto
                  name="bookmark-alt"
                  size={28}
                  color={colors.graphite[800]}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
};

export default BookmarkList;
