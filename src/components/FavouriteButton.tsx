import { View, TouchableOpacity } from 'react-native';
import { Book } from '@/src/data/watermelondb/models';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { withObservables } from '@nozbe/watermelondb/react';

const FavouriteButton = ({ book }: { book: Book }) => {
  return (
    <View className="flex flex-row items-center gap-4">
      <TouchableOpacity
        onPress={async () => {
          await book?.toggleIsFavourite();
        }}
      >
        {book?.isFavorite ? (
          <AntDesign name="star" size={28} color="gold" />
        ) : (
          <Feather name="star" size={28} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// 2. The "Enhancer"
// This makes the component listen to the database.
const enhance = withObservables(['book'], ({ book }) => ({
  book: book.observe(),
}));

export default enhance(FavouriteButton);
