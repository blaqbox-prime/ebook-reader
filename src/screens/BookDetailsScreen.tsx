import { images } from '@/assets';
import { Book, Metadata } from '@/src/data/watermelondb/models';
import {
  computeCurrentPage,
  computeTimeLeftMinutes,
  computeTotalMinutes,
  formatDuration,
  formatFileSize,
  formatPublishedDate,
  formatRating,
  formatTimeLeft,
  getCategoryChips,
  getCoverUri,
} from '@/src/utils/bookDetailsUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { withObservables } from '@nozbe/watermelondb/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getStatusLabel = (progress: number): string => {
  if (progress >= 100) return 'Finished';
  if (progress > 0) return 'Currently Reading';
  return 'Not Started';
};

export const BookDetails = ({
  book,
  metadata,
  readingNote,
}: {
  book: Book;
  metadata: Metadata | null;
  readingNote?: string;
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const progress = Math.round(book.progress);
  const pageCount = metadata?.pageCount;
  const currentPage = computeCurrentPage(book.progress, pageCount);
  const rating = formatRating(metadata?.averageRating);
  const totalMinutes = computeTotalMinutes(pageCount);
  const timeLeftMinutes = computeTimeLeftMinutes(book.progress, pageCount);
  const fileSize = formatFileSize(book.fileSize);
  const publishedDate = formatPublishedDate(metadata?.publishedDate);
  const categoryChips = getCategoryChips(metadata?.categories);
  const coverUri = getCoverUri(book.coverImage, metadata?.coverImage);
  const statusLabel = getStatusLabel(progress);
  const timeLeftText =
    progress >= 100
      ? 'Completed'
      : timeLeftMinutes !== null
        ? formatTimeLeft(timeLeftMinutes)
        : null;

  const handleReadBook = () => {
    void book.updateLastRead();
    router.push({
      pathname: `/reader/[uri]`,
      params: { uri: book.uri },
    });
  };

  const handleToggleFavourite = async () => {
    await book.toggleIsFavourite();
  };

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top']}>
      {/* Header */}
      <View className="h-16 px-4 flex-row items-center justify-between">
        <View className="flex-row items-center min-w-0 flex-1">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            accessibilityLabel="Navigate back"
            className="w-11 h-11 items-center justify-center rounded-full"
          >
            <MaterialIcons name="arrow-back" size={23} color="#1b1c1a" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-1 flex-shrink ml-1">
            <Image
              source={images.logo_transparent}
              className="h-7 w-7"
              resizeMode="contain"
            />
            <Text className="font-heading text-[20px] leading-7 text-m3-on-surface truncate">
              Book Details
            </Text>
          </View>
        </View>
        <View className="w-11 h-11 items-center justify-center rounded-full bg-m3-surface-high">
          <MaterialIcons name="person" size={20} color="#52443b" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-10"
      >
        {/* Top Floating Action Ribbon */}
        <View className="flex-row items-center justify-between w-full py-1 mb-2">
          <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-m3-secondary-container">
            <MaterialIcons name="menu-book" size={15} color="#554424" />
            <Text className="text-[11px] leading-4 uppercase tracking-wider font-bold text-m3-on-secondary-container">
              {statusLabel}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleToggleFavourite}
            accessibilityRole="button"
            accessibilityLabel="Toggle favorite"
            className="w-10 h-10 rounded-full items-center justify-center bg-m3-surface-low shadow-sm active:scale-95"
          >
            <MaterialIcons
              name={book.isFavorite ? 'favorite' : 'favorite-border'}
              size={22}
              color={book.isFavorite ? '#5c2d00' : '#857469'}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Visual / Book Cover Presentation */}
        <View className="items-center justify-center relative my-2">
          <View className="absolute w-44 h-60 rounded-full bg-m3-primary/10 transform scale-110 pointer-events-none" />
          <View className="relative">
            <View className="w-48 h-72 rounded-2xl overflow-hidden bg-m3-surface-high shadow-sm">
              <Image
                source={coverUri ? { uri: coverUri } : images.cover}
                resizeMode="cover"
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-m3-surface-lowest/90 flex-row items-center gap-1">
              <MaterialIcons name="auto-stories" size={14} color="#5c2d00" />
              <Text className="text-[11px] leading-4 text-m3-on-surface">
                EPUB
              </Text>
            </View>
          </View>
        </View>

        {/* Book Title, Author & Genre Chips */}
        <View className="items-center text-center mt-3 px-1">
          <Text className="font-heading text-[24px] leading-8 text-m3-on-surface font-semibold tracking-tight text-center">
            {book.title}
          </Text>
          {metadata?.subtitle ? (
            <Text className="text-[15px] leading-6 text-m3-secondary mt-1 text-center">
              {metadata.subtitle}
            </Text>
          ) : null}
          <Text className="text-[16px] leading-6 text-m3-secondary mt-2">
            {book.author}
          </Text>
          {categoryChips.length > 0 ? (
            <View className="flex-row flex-wrap items-center justify-center gap-2 mt-3">
              {categoryChips.map(chip => (
                <View
                  key={chip}
                  className="px-3 py-1 rounded-full bg-m3-surface-low shadow-sm"
                >
                  <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Progress Section */}
        <View className="mt-6 w-full bg-m3-surface-low rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="bookmark" size={18} color="#5c2d00" />
              <Text className="text-[14px] leading-5 text-m3-on-surface font-semibold">
                Reading Progress
              </Text>
            </View>
            <Text className="text-[12px] leading-4 text-m3-primary font-bold">
              {progress}%
            </Text>
          </View>
          <View className="w-full h-2 rounded-full bg-m3-secondary-container overflow-hidden my-1">
            <View
              className="h-full bg-m3-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-[12px] leading-4 text-m3-on-surface-variant">
              {currentPage !== null
                ? `Page ${currentPage} of ${pageCount}`
                : `${progress}% completed`}
            </Text>
            {timeLeftText ? (
              <Text className="flex-row items-center gap-1 text-m3-secondary">
                <MaterialIcons name="timer" size={14} color="#6e5c39" />
                {timeLeftText}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Primary CTA Action */}
        <View className="mt-4 w-full">
          <TouchableOpacity
            onPress={handleReadBook}
            accessibilityRole="button"
            className="w-full h-14 rounded-full bg-m3-primary items-center justify-center flex-row gap-2 shadow-sm active:scale-[0.98]"
          >
            <MaterialIcons name="menu-book" size={22} color="#ffffff" />
            <Text className="text-[14px] leading-5 text-m3-on-primary font-semibold">
              Read Book
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Metadata Row */}
        <View className="flex-row gap-3 mt-4 w-full">
          <View className="flex-1 items-center justify-center p-3 rounded-xl bg-m3-surface-low shadow-sm">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="star" size={17} color="#5a2e00" />
              <Text className="text-[14px] leading-5 font-bold text-m3-on-surface">
                {rating ?? '—'}
              </Text>
            </View>
            <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
              Rating
            </Text>
          </View>
          <View className="flex-1 items-center justify-center p-3 rounded-xl bg-m3-surface-low shadow-sm">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="schedule" size={17} color="#5c2d00" />
              <Text className="text-[14px] leading-5 font-bold text-m3-on-surface">
                {totalMinutes !== null ? formatDuration(totalMinutes) : '—'}
              </Text>
            </View>
            <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
              Total Time
            </Text>
          </View>
          <View className="flex-1 items-center justify-center p-3 rounded-xl bg-m3-surface-low shadow-sm">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="folder-zip" size={17} color="#6e5c39" />
              <Text className="text-[14px] leading-5 font-bold text-m3-on-surface">
                {fileSize ?? '—'}
              </Text>
            </View>
            <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
              EPUB File
            </Text>
          </View>
        </View>

        {/* Summary Card Section */}
        {metadata?.description ? (
          <View className="mt-6 w-full bg-m3-surface-mid rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[16px] leading-6 text-m3-on-surface font-bold">
                Summary
              </Text>
              <MaterialIcons name="format-quote" size={20} color="#857469" />
            </View>
            <Text
              numberOfLines={isExpanded ? undefined : 3}
              className="text-[14px] leading-5 text-m3-on-surface-variant"
            >
              {metadata.description}
            </Text>
            <TouchableOpacity
              onPress={() => setIsExpanded(prev => !prev)}
              accessibilityRole="button"
              className="mt-1 self-start flex-row items-center gap-0.5"
            >
              <Text className="text-[12px] leading-4 text-m3-primary font-bold">
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
              <MaterialIcons
                name={isExpanded ? 'expand-less' : 'expand-more'}
                size={16}
                color="#5c2d00"
              />
            </TouchableOpacity>

            {/* Publisher Metadata Sub-Block */}
            {metadata.publisher ||
            publishedDate ||
            metadata.language ||
            metadata.isbn ? (
              <View className="mt-4 bg-m3-surface-low rounded-xl p-3 flex flex-col gap-1">
                {metadata.publisher ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[12px] leading-4 text-m3-outline">
                      Publisher
                    </Text>
                    <Text className="text-[12px] leading-4 font-semibold text-m3-on-surface flex-shrink ml-2">
                      {metadata.publisher}
                    </Text>
                  </View>
                ) : null}
                {publishedDate ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[12px] leading-4 text-m3-outline">
                      Release Date
                    </Text>
                    <Text className="text-[12px] leading-4 font-semibold text-m3-on-surface flex-shrink ml-2">
                      {publishedDate}
                    </Text>
                  </View>
                ) : null}
                {metadata.language ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[12px] leading-4 text-m3-outline">
                      Language
                    </Text>
                    <Text className="text-[12px] leading-4 font-semibold text-m3-on-surface flex-shrink ml-2">
                      {metadata.language.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                {metadata.isbn ? (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[12px] leading-4 text-m3-outline">
                      ISBN
                    </Text>
                    <Text className="text-[12px] leading-4 font-semibold text-m3-on-surface flex-shrink ml-2">
                      {metadata.isbn}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Readers Notes & Quote Highlight Capsule */}
        {readingNote ? (
          <View className="mt-4 w-full bg-m3-secondary-container/40 rounded-xl p-4 flex-row items-start gap-3">
            <MaterialIcons name="edit-note" size={20} color="#5c2d00" />
            <View className="flex-col flex-shrink">
              <Text className="text-[12px] leading-4 text-m3-on-secondary-container font-bold">
                Reading Note
              </Text>
              <Text className="text-[12px] leading-4 text-m3-on-surface italic mt-0.5">
                {readingNote}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

// 2. The "Enhancer"
// This makes the component listen to the database.
const enhance = withObservables(['book'], ({ book }: { book: Book }) => ({
  book: book.observe(),
}));

export default enhance(BookDetails);