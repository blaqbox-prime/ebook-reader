import { BookmarkWithContext } from '@/src/types/reader.types';
import { useBookmarksStore } from '@/src/store';
import { Alert, View } from 'react-native';
import BookmarkCard from '@/src/components/BookmarkCard';

const BookmarkList = ({
  data,
  onShare,
  onJump,
  onDeleted,
}: {
  data: BookmarkWithContext[];
  onShare: (bookmark: BookmarkWithContext) => void;
  onJump: (bookmark: BookmarkWithContext) => void;
  onDeleted: (bookmark: BookmarkWithContext) => void;
}) => {
  const { removeBookmark } = useBookmarksStore();

  const handleDeleteBookmark = (bookmark: BookmarkWithContext) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        {
          text: 'CANCEL',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'DELETE',
          onPress: () => {
            removeBookmark(bookmark);
            onDeleted(bookmark);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-col gap-3">
      {data.map(item => (
        <BookmarkCard
          key={item.id}
          bookmark={item}
          onShare={onShare}
          onJump={onJump}
          onDelete={handleDeleteBookmark}
        />
      ))}
    </View>
  );
};

export default BookmarkList;
