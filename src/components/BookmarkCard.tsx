import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BookmarkWithContext } from '@/src/types/reader.types';
import { formatTimestamp } from '@/src/utils';
import { Text, TouchableOpacity, View } from 'react-native';

type ChapterBackedBookmark = BookmarkWithContext & {
  chapter?: { label?: string; href?: string };
};

const getChapterLabel = (bookmark: BookmarkWithContext): string => {
  const withChapter = bookmark as ChapterBackedBookmark;
  const label = withChapter.chapter?.label ?? bookmark.section?.label;
  return label?.trim() ? label : '';
};

const getPage = (bookmark: BookmarkWithContext): number =>
  bookmark.location?.start?.displayed?.page ??
  bookmark.location?.start?.location ??
  0;

const BookmarkCard = ({
  bookmark,
  onShare,
  onJump,
  onDelete,
}: {
  bookmark: BookmarkWithContext;
  onShare: (bookmark: BookmarkWithContext) => void;
  onJump: (bookmark: BookmarkWithContext) => void;
  onDelete: (bookmark: BookmarkWithContext) => void;
}) => {
  const chapter = getChapterLabel(bookmark);
  const page = getPage(bookmark);
  const excerpt = bookmark.text?.trim() || 'No bookmark text';
  const addedAt = bookmark.createdAt ?? bookmark.id;

  return (
    <View className="bg-m3-surface-low rounded-xl p-4 shadow-sm flex-col gap-2.5">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-col flex-1 min-w-0">
          <Text className="text-[15px] leading-5 text-m3-primary font-bold truncate">
            {bookmark.bookTitle.trim() || 'Untitled'}
          </Text>
          {chapter ? (
            <View className="flex-row items-center gap-1 mt-1 self-start bg-m3-surface-highest rounded-md px-2 py-0.5">
              <MaterialIcons name="menu-book" size={13} color="#52443b" />
              <Text
                numberOfLines={1}
                className="text-[11px] leading-4 text-m3-on-surface-variant"
              >
                {chapter}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1 flex-shrink-0 bg-m3-primary-fixed rounded-full px-2 py-0.5">
          <MaterialIcons name="bookmark" size={14} color="#301400" />
          <Text className="text-[11px] leading-4 text-m3-on-primary-fixed font-bold">
            {page > 0 ? `Page ${page}` : 'Bookmark'}
          </Text>
        </View>
      </View>

      <View className="bg-m3-surface-mid/60 rounded-lg overflow-hidden">
        <View className="flex-row">
          <View className="w-1 bg-m3-surface-tint" />
          <View className="flex-1 py-1.5 pr-2 pl-3.5">
            <Text className="text-[14px] leading-5 text-m3-on-surface italic font-lora">
              {'\u201C'}
              {excerpt}
              {'\u201D'}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-y-2 pt-1">
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="schedule" size={14} color="#52443b" />
          <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
            Added {formatTimestamp(addedAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={() => onShare(bookmark)}
            className="h-8 px-3 rounded-full bg-m3-surface-mid flex-row items-center justify-center gap-1"
          >
            <MaterialIcons name="share" size={16} color="#1b1c1a" />
            <Text className="text-[11px] leading-4 text-m3-on-surface font-semibold">
              Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onJump(bookmark)}
            className="h-8 px-3 rounded-full bg-m3-primary flex-row items-center justify-center gap-1 shadow-sm"
          >
            <MaterialIcons name="open-in-new" size={16} color="#ffffff" />
            <Text className="text-[11px] leading-4 text-m3-on-primary font-semibold">
              Jump
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(bookmark)}
            className="w-8 h-8 rounded-full bg-m3-surface-mid items-center justify-center"
          >
            <MaterialIcons name="delete" size={16} color="#52443b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BookmarkCard;
