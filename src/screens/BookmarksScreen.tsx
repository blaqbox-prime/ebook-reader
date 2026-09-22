import { images } from '@/assets';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import {
  ActionToast,
  BookmarkList,
  EmptyStateView,
  FavoritesList,
  Header,
  SegmentedTabs,
  ToastIconName,
} from '@/src/components';
import { SegmentedTab } from '@/src/components/SegmentedTabs';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { useBookmarksStore } from '@/src/store';
import { BookmarkWithContext } from '@/src/types/reader.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortKey = 'recent' | 'oldest' | 'title';
type ActiveTab = 'bookmarks' | 'favorites';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'title', label: 'Title A–Z' },
];

const getChapterText = (bookmark: BookmarkWithContext): string =>
  (
    (bookmark as { chapter?: { label?: string } }).chapter?.label ??
    bookmark.section?.label ??
    ''
  ).trim();

const webClipboard = (
  globalThis as unknown as {
    navigator?: { clipboard?: { writeText: (text: string) => Promise<void> } };
  }
).navigator?.clipboard;

const BookmarksScreen = () => {
  const router = useRouter();
  const { bookmarks, loadBookmarks } = useBookmarksStore();

  const [favorites, setFavorites] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('bookmarks');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [isSortOpen, setSortOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    icon?: ToastIconName;
  } | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const favoritesTopRef = useRef(0);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const fetchFavorites = useCallback(async () => {
    const bookService = new BookService();
    const favouriteBooks = await bookService.getFavorites();
    setFavorites(favouriteBooks);
  }, []);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  const showToast = useCallback((message: string, icon?: ToastIconName) => {
    setToast({ message, icon });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
    void fetchFavorites();
    setRefreshing(false);
  };

  const visibleBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = bookmarks.filter(bookmark => {
      if (!q) return true;
      return (
        bookmark.bookTitle.toLowerCase().includes(q) ||
        (bookmark.text?.toLowerCase() ?? '').includes(q) ||
        getChapterText(bookmark).toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      const aTime = a.createdAt ?? a.id;
      const bTime = b.createdAt ?? b.id;
      if (sortKey === 'oldest') return aTime - bTime;
      if (sortKey === 'title') return a.bookTitle.localeCompare(b.bookTitle);
      return bTime - aTime;
    });
  }, [bookmarks, query, sortKey]);

  const sortLabel =
    SORT_OPTIONS.find(option => option.key === sortKey)?.label ?? '';

  const handleSwitchTab = (key: string) => {
    setActiveTab(key as ActiveTab);
    if (key === 'favorites') {
      if (favorites.length === 0) {
        showToast('No favorited editions yet', 'favorite-border');
      } else {
        scrollRef.current?.scrollTo({
          y: Math.max(0, favoritesTopRef.current - 12),
          animated: true,
        });
        showToast('Viewing favorited editions & notes', 'favorite');
      }
    } else {
      showToast('Viewing all bookmarks', 'bookmark');
    }
  };

  const handleShare = async (bookmark: BookmarkWithContext) => {
    const page =
      bookmark.location?.start?.displayed?.page ??
      bookmark.location?.start?.location ??
      0;
    const message = `\u201C${bookmark.text?.trim() ?? ''}\u201D \u2014 ${
      bookmark.bookTitle
    }${page > 0 ? ` (Page ${page})` : ''}`;

    if (Platform.OS === 'web' && webClipboard) {
      try {
        await webClipboard.writeText(message);
        showToast('Quote snippet copied to clipboard!', 'content-copy');
      } catch {
        showToast('Could not copy quote', 'error');
      }
      return;
    }

    try {
      await Share.share({ message });
      showToast('Quote snippet shared!', 'share');
    } catch {
      showToast('Could not share quote', 'error');
    }
  };

  const handleJump = (bookmark: BookmarkWithContext) => {
    router.push({
      pathname: '/reader/[uri]',
      params: {
        uri: bookmark.bookUri,
        location:
          bookmark.location?.start?.cfi ?? bookmark.location?.start?.href ?? '',
      },
    });
  };

  const handleDeleted = () => {
    showToast('Bookmark removed', 'delete');
  };

  const tabs: SegmentedTab[] = [
    {
      key: 'bookmarks',
      label: 'Bookmarks',
      icon: 'bookmark-border',
      iconFilled: 'bookmark',
      badge: bookmarks.length,
    },
    {
      key: 'favorites',
      label: 'Favorites',
      icon: 'favorite-border',
      iconFilled: 'favorite',
      badge: favorites.length,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-m3-surface" edges={['top']}>
      <Header />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5c2d00"
          />
        }
      >
        <View className="px-6 flex-col">
          <View className="flex-row items-center justify-between mt-1 mb-4">
            <View className="flex-col flex-1 min-w-0">
              <Text className="font-heading text-[24px] leading-8 text-m3-on-surface">
                Bookmarks & Highlights
              </Text>
              <Text className="text-[12px] leading-4 text-m3-on-surface-variant mt-0.5">
                Your treasured passages and dog-eared pages
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-m3-secondary-container rounded-full px-3 py-1.5 shadow-sm ml-3 flex-shrink-0">
              <MaterialIcons name="auto-stories" size={18} color="#5c2d00" />
              <Text className="text-[12px] leading-4 font-semibold text-m3-on-secondary-container">
                {bookmarks.length} Saved
              </Text>
            </View>
          </View>

          <SegmentedTabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={handleSwitchTab}
          />

          {favorites.length > 0 ? (
            <View
              className="mt-6"
              onLayout={event => {
                favoritesTopRef.current = event.nativeEvent.layout.y;
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-1">
                  <MaterialIcons
                    name="auto-awesome"
                    size={20}
                    color="#5c2d00"
                  />
                  <Text className="text-[15px] leading-5 font-bold text-m3-on-surface">
                    Favorited Editions
                  </Text>
                </View>
                <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                  {favorites.length} volumes
                </Text>
              </View>
              <FavoritesList books={favorites} />
            </View>
          ) : null}

          <View className="mt-6 h-12 px-4 rounded-full bg-m3-surface-high flex-row items-center">
            <MaterialIcons name="search" size={22} color="#52443b" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search bookmarks, chapters…"
              placeholderTextColor="#857469"
              className="flex-1 ml-2 text-sm text-m3-on-surface"
            />
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                className="w-7 h-7 items-center justify-center rounded-full"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            ) : (
              <MaterialIcons
                name="collections-bookmark"
                size={20}
                color="#52443b"
              />
            )}
          </View>

          <View className="flex-row items-center justify-between mb-3 mt-5">
            <View className="flex-row items-center gap-1">
              <MaterialIcons
                name="collections-bookmark"
                size={20}
                color="#5c2d00"
              />
              <Text className="text-[15px] leading-5 font-bold text-m3-on-surface">
                Saved Snippets & Pages
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSortOpen(true)}
              className="flex-row items-center gap-1 bg-m3-surface-low px-2.5 py-1 rounded-lg shadow-sm"
            >
              <MaterialIcons name="sort" size={16} color="#52443b" />
              <Text className="text-[11px] leading-4 text-m3-on-surface-variant">
                {sortLabel}
              </Text>
            </TouchableOpacity>
          </View>

          {visibleBookmarks.length === 0 ? (
            bookmarks.length === 0 ? (
              <EmptyStateView
                image={images.bookshelf}
                message={'No bookmarks available.'}
                showButton={false}
              />
            ) : (
              <Text className="text-center text-m3-on-surface-variant text-[13px] leading-5 py-10">
                No bookmarks match {query.trim()}.
              </Text>
            )
          ) : (
            <BookmarkList
              data={visibleBookmarks}
              onShare={handleShare}
              onJump={handleJump}
              onDeleted={handleDeleted}
            />
          )}
        </View>
      </ScrollView>

      <Actionsheet
        isOpen={isSortOpen}
        onClose={() => setSortOpen(false)}
        snapPoints={[35]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-m3-surface-high px-5 pb-8 pt-3">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator className="bg-m3-outline/40" />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full">
            <View className="flex-row items-center justify-between pb-2">
              <Text className="font-lato-black text-base text-m3-on-surface flex-1">
                Sort bookmarks
              </Text>
              <TouchableOpacity
                onPress={() => setSortOpen(false)}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color="#52443b" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map(option => {
              const active = option.key === sortKey;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => {
                    setSortKey(option.key);
                    setSortOpen(false);
                    showToast(
                      `Sorted by ${option.label.toLowerCase()}`,
                      'sort'
                    );
                  }}
                  className="w-full flex-row items-center gap-3 px-3 py-2.5 rounded-xl"
                >
                  <MaterialIcons
                    name={active ? 'radio-button-checked' : 'radio-button-off'}
                    size={20}
                    color={active ? '#5c2d00' : '#52443b'}
                  />
                  <Text
                    className={`font-lato-regular text-base ${
                      active
                        ? 'text-m3-primary font-bold'
                        : 'text-m3-on-surface'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <ActionToast
        message={toast?.message ?? null}
        icon={toast?.icon}
        visible={toast !== null}
      />
    </SafeAreaView>
  );
};

export default BookmarksScreen;
