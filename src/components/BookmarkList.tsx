import { View, Text, Animated, FlatList } from 'react-native';
import React from 'react';
import { Bookmark } from '@epubjs-react-native/core';

type BookmarkListProps = {
  bookmarks: Bookmark[];
};

const BookmarkList = ({ bookmarks }: BookmarkListProps) => {
  return (
    <FlatList
      data={bookmarks}
      extraData={bookmarks}
      keyExtractor={bookmark => `${bookmark.id}`}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }: { item: any }) => {
        console.log('Bookmark item: ', item);
        return (
          <View className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-2">
              {item.chapter.label.trim() || 'Untitled Chapter'}
            </Text>
            <Text className="text-secondary-500 font-semibold mb-2 line-clamp-2">
              {item.text.trim() || 'No bookmark text'}
            </Text>
          </View>
        );
      }}
    />
  );
};

export default BookmarkList;
