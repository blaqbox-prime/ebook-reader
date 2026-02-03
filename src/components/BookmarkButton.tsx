import { View, TouchableOpacity } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';

type BookmarkButtonProps = {
  isBookmarked: boolean;
};

const BookmarkButton = ({ isBookmarked }: BookmarkButtonProps) => {
  return (
    <View className="flex flex-row items-center">
      <TouchableOpacity
        onPress={() => {
          // toggleBookmark();
        }}
      >
        {isBookmarked ? (
          <Fontisto name="bookmark-alt" size={24} color="black" />
        ) : (
          <Fontisto name="bookmark" size={24} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BookmarkButton;
