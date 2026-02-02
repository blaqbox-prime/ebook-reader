import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { images } from '@/assets';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BookmarkButton from '@/src/components/BookmarkButton';

const ICON_SIZE = 20;

const ReaderOptionsFAB = ({
  showFab = false,
  reader,
}: {
  showFab: boolean;
  reader: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);
  const {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
  } = reader;

  const Backdrop = () => (
    <TouchableWithoutFeedback onPress={toggleOpen}>
      <View className="absolute top-0 left-0 right-0 bottom-0 z-10 inset-0 bg-black opacity-15"></View>
    </TouchableWithoutFeedback>
  );

  const handleChangeBookmark = () => {
    console.info('handleChangeBookmark');
    const location = getCurrentLocation();
    console.log(location, isBookmarked, bookmarks);
    if (!location) return;

    if (isBookmarked) {
      const bookmark = bookmarks.find(
        (item: any) =>
          item.location.start.cfi === location?.start.cfi &&
          item.location.end.cfi === location?.end.cfi
      );

      if (!bookmark) return;
      removeBookmark(bookmark);
    } else addBookmark(location);
  };

  const OPTION_ITEMS = [
    {
      icon: <BookmarkButton isBookmarked={isBookmarked} />,
      label: `${isBookmarked ? 'Remove' : 'Add'} Bookmark`,
      action: () => {
        handleChangeBookmark();
      },
    },
    {
      icon: <Feather name="moon" size={ICON_SIZE} color={'black'} />,
      label: 'Night Mode',
      action: () => {},
    },
    {
      icon: <MaterialIcons name="toc" size={ICON_SIZE} color={'black'} />,
      label: 'Table of Contents',
      action: () => {},
    },
  ];

  const actionButtons = OPTION_ITEMS.slice()
    .reverse()
    .map(option => {
      return (
        <TouchableOpacity key={option.label} onPress={option.action}>
          <View className="flex-row items-center gap-3 my-3 pr-2">
            <Text className="px-3 py-2 rounded-lg shadow-md bg-app-taupe-grey-400 text-app-taupe-grey-800">
              {option.label}
            </Text>

            {/* Individual Option Button */}
            <View className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-app-taupe-grey-400">
              {option.icon}
            </View>
          </View>
        </TouchableOpacity>
      );
    });

  return (
    <>
      {isOpen && <Backdrop />}
      <View className="z-10 absolute bottom-10 right-10 items-end">
        {isOpen && (
          // Vertical stack for options, reverse order to ensure the list expands upwards
          <View className="flex flex-col space-y-3 mb-4 items-end">
            {actionButtons.map(button => button)}
          </View>
        )}

        {showFab && (
          <TouchableWithoutFeedback onPress={toggleOpen}>
            <View className="items-center justify-center bg-primary-500 h-16 w-16 p-2 rounded-full z-50 ">
              <Image
                source={images.logo_transparent}
                className="w-full h-full overflow-hidden"
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </>
  );
};

export default ReaderOptionsFAB;
