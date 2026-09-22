import { images } from '@/assets';
import {
  EmptyStateView,
  LibraryBookTile,
  LoadingPulse,
} from '@/src/components';
import { useLibraryStore, useUserStatsStore } from '@/src/store';
import { Book } from '@/src/data/watermelondb/models';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/src/components/Header';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

type ChipFilter = 'all' | 'in-progress' | 'finished';

const DAILY_GOAL_MINUTES = 5;
const FILTERS: { key: ChipFilter; label: string }[] = [
  { key: 'all', label: 'All Books' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'finished', label: 'Finished' },
];

const Library = () => {
  const {
    books,
    loading,
    refreshing,
    fetchBooks,
    addBooks,
    refreshBooks,
    removeBook,
  } = useLibraryStore();
  const { todayMinutesRead, currentStreak } = useUserStatsStore();

  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<ChipFilter>('all');
  const [sheetBook, setSheetBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  if (loading) {
    return <LoadingPulse key={'pulse'} />;
  }

  const matchesFilter = (book: Book) => {
    if (activeChip === 'in-progress') {
      return book.progress > 0 && book.progress < 100;
    }
    if (activeChip === 'finished') {
      return book.progress >= 100;
    }
    return true;
  };

  const matchesQuery = (book: Book) => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q)
    );
  };

  const visibleBooks = books.filter(
    book => matchesFilter(book) && matchesQuery(book)
  );
  const inProgressCount = books.filter(
    book => book.progress > 0 && book.progress < 100
  ).length;

  const remainingToday = Math.max(0, DAILY_GOAL_MINUTES - todayMinutesRead);
  const streakSubtext =
    remainingToday > 0
      ? `Read ${remainingToday} min today to hit day ${currentStreak + 1}`
      : 'Goal met today — keep it going!';

  const closeSheet = () => setSheetBook(null);

  const handleToggleFavourite = async () => {
    if (!sheetBook) return;
    const book = sheetBook;
    setSheetBook(null);
    try {
      await book.toggleIsFavourite();
      await fetchBooks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = () => {
    if (!sheetBook) return;
    const book = sheetBook;
    setSheetBook(null);
    Alert.alert('Remove book', `Remove "${book.title}" from your device?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeBook(book);
        },
      },
    ]);
  };

  const renderChip = (filter: { key: ChipFilter; label: string }) => {
    const active = activeChip === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        onPress={() => setActiveChip(filter.key)}
        className={`flex-row items-center gap-1.5 h-8 px-4 rounded-full shadow-sm ${
          active ? 'bg-m3-secondary-container' : 'bg-m3-surface-low'
        }`}
      >
        {active && <MaterialIcons name="check" size={16} color="#5c2d00" />}
        <Text
          className={`text-[12px] leading-4 font-semibold ${
            active
              ? 'text-m3-on-secondary-container'
              : 'text-m3-on-surface-variant'
          }`}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 " edges={['top']}>
      <Header />
      <View className="flex-1 px-6">
        <FlatList
          data={visibleBooks}
          extraData={visibleBooks}
          numColumns={2}
          horizontal={false}
          keyExtractor={book => book.uri}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="w-1/2 p-2">
              <LibraryBookTile book={item} onOptionsPress={setSheetBook} />
            </View>
          )}
          ListHeaderComponent={
            <View className="pb-2">
              <View className="items-center py-1">
                <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-m3-surface-low shadow-sm">
                  <MaterialIcons name="sync" size={16} color="#5c2d00" />
                  <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                    {refreshing
                      ? 'Syncing…'
                      : 'Updated just now · Pull to sync'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-4 my-3">
                <View className="flex-col min-w-0">
                  <Text className="font-heading text-[28px] leading-9 text-m3-primary tracking-tight">
                    My Library
                  </Text>
                  <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
                    {books.length} active volumes · {inProgressCount} in
                    progress
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={addBooks}
                  className="h-10 px-4 rounded-full bg-m3-primary flex-row items-center gap-1 shadow-sm flex-shrink-0"
                >
                  <MaterialIcons name="add" size={20} color="#ffffff" />
                  <Text className="text-[14px] leading-5 text-m3-on-primary font-semibold">
                    Add books
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="my-4 h-16 px-4 rounded-full bg-m3-surface-high flex-row items-center">
                <MaterialIcons name="search" size={24} color="#52443b" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search titles, authors…"
                  placeholderTextColor="#857469"
                  className="flex-1 ml-2 font-lato-regular text-sm text-m3-on-surface"
                />
                <MaterialIcons name="tune" size={20} color="#52443b" />
              </View>

              <View className="flex-row gap-2 my-3">
                {FILTERS.map(renderChip)}
              </View>
            </View>
          }
          ListFooterComponent={
            <View className="p-2 mt-4">
              <View className="p-4 rounded-2xl bg-m3-secondary-container/40 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center gap-3 flex-1 min-w-0">
                  <View className="w-10 h-10 rounded-full bg-m3-secondary-container items-center justify-center flex-shrink-0">
                    <MaterialIcons
                      name="local-cafe"
                      size={22}
                      color="#5c2d00"
                    />
                  </View>
                  <View className="flex-col min-w-0 flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-lato-black text-sm leading-5 text-m3-on-surface"
                    >
                      Reading Streak Active
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5"
                    >
                      {streakSubtext}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1 pl-2 flex-shrink-0">
                  <MaterialIcons name="bolt" size={18} color="#5c2d00" />
                  <Text className="font-lato-black text-sm text-m3-primary">
                    {currentStreak}d
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            books.length === 0 ? (
              <EmptyStateView
                image={images.bookshelf}
                message={'No books available.'}
                showButton={true}
                buttonText={'Add Books'}
                buttonIcon={<Feather name={'plus'} size={24} color="white" />}
                buttonAction={addBooks}
              />
            ) : (
              <Text className="text-center text-m3-on-surface-variant mt-8">
                No books match your search.
              </Text>
            )
          }
          refreshing={refreshing}
          onRefresh={refreshBooks}
        />
      </View>

      <Actionsheet
        isOpen={sheetBook !== null}
        onClose={closeSheet}
        snapPoints={[35]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-m3-outline/40" />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full">
            <View className="flex-row items-center justify-between pb-2">
              <Text
                numberOfLines={1}
                className="font-lato-black text-base text-m3-on-surface flex-1"
              >
                {sheetBook?.title}
              </Text>
              <TouchableOpacity
                onPress={closeSheet}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleToggleFavourite}
              className="w-full flex-row items-center gap-3 px-3 py-2.5 rounded-xl"
            >
              <MaterialIcons
                name={
                  sheetBook?.isFavorite ? 'bookmark-remove' : 'bookmark-add'
                }
                size={20}
                color="#5c2d00"
              />
              <Text className="font-lato-regular text-base text-m3-on-surface">
                {sheetBook?.isFavorite
                  ? 'Remove from Collection'
                  : 'Add to Collection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemove}
              className="w-full flex-row items-center gap-3 px-3 py-2.5 rounded-xl"
            >
              <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" />
              <Text className="font-lato-regular text-base text-m3-error">
                Remove from Device
              </Text>
            </TouchableOpacity>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
};

export default Library;
