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
import { Themes } from '@epubjs-react-native/core';
const ICON_SIZE = 20;

const THEMES = Object.values(Themes).slice(0, 2);
const ReaderOptionsFAB = ({
  showFab = false,
  reader,
  toggleToc,
  switchTheme,
  toggleReaderSettings,
}: {
  toggleToc: () => void;
  toggleReaderSettings: () => void;
  switchTheme: any;
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

  const index = Object.values(THEMES).indexOf(reader.theme);

  // Backdrops
  const Backdrop = () => (
    <TouchableWithoutFeedback onPress={toggleOpen}>
      <View className="absolute top-0 left-0 right-0 bottom-0 z-10 inset-0 bg-black opacity-15"></View>
    </TouchableWithoutFeedback>
  );

  // Toggling Bookmark
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

  // Action Buttons props
  const OPTION_ITEMS = [
    {
      icon: <Feather name="settings" size={ICON_SIZE} color={'black'} />,
      label: 'Reader Settings',
      action: () => {
        toggleReaderSettings();
      },
    },
    {
      icon: <BookmarkButton isBookmarked={isBookmarked} />,
      label: `${isBookmarked ? 'Remove' : 'Add'} Bookmark`,
      action: () => {
        handleChangeBookmark();
      },
    },
    {
      icon:
        index === 0 ? (
          <Feather name="moon" size={ICON_SIZE} color={'black'} />
        ) : (
          <Feather name="sun" size={ICON_SIZE} color={'black'} />
        ),
      label: index === 0 ? 'Night Mode' : 'Light Mode',
      action: () => {
        switchTheme();
      },
    },
    {
      icon: <MaterialIcons name="toc" size={ICON_SIZE} color={'black'} />,
      label: 'Table of Contents',
      action: () => {
        toggleToc();
      },
    },
  ];

  // Action Button Elements
  const actionButtons = OPTION_ITEMS.slice()
    .reverse()
    .map(option => {
      return (
        <TouchableOpacity key={option.label} onPress={option.action}>
          <View className="flex-row items-center gap-3 my-3 pr-2">
            <Text className="px-3 py-2 rounded-lg shadow-md bg-primary-500 text-app-taupe-grey-900">
              {option.label}
            </Text>

            {/* Individual Option Button */}
            <View className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-primary-500">
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
