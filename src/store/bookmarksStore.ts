import { create } from 'zustand';
import { Bookmark } from '@epubjs-react-native/core';
import BookmarkService from '@/src/services/BookmarkService';
import { BookmarkWithContext } from '@/src/types/reader.types';

interface BookmarksState {
  bookmarks: BookmarkWithContext[];
  addBookmark: (bookmark: Bookmark, bookUri: string, bookTitle: string) => void;
  removeBookmark: (bookmark: Bookmark) => void;
  clearBookmarks: () => void;
  getBookmarks: () => BookmarkWithContext[];
  isBookmarked: (bookmark: BookmarkWithContext) => boolean;
  getBookmarkCount: () => number;
  getBookmarksByBookUri: (bookUri: string) => BookmarkWithContext[];
  loadBookmarks: () => void;
}

const bookmarkService = new BookmarkService();

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  bookmarks: bookmarkService.getBookmarks(),

  addBookmark: (bookmark: Bookmark, bookUri: string, bookTitle: string) => {
    bookmarkService.addBookmark(bookmark, bookUri, bookTitle);
    set({ bookmarks: bookmarkService.getBookmarks() });
  },

  removeBookmark: (bookmark: Bookmark) => {
    bookmarkService.removeBookmark(bookmark);
    set({ bookmarks: bookmarkService.getBookmarks() });
  },

  clearBookmarks: () => {
    bookmarkService.clearBookmarks();
    set({ bookmarks: [] });
  },

  getBookmarks: () => get().bookmarks,

  isBookmarked: (bookmark: BookmarkWithContext) =>
    bookmarkService.isBookmarked(bookmark),

  getBookmarkCount: () => bookmarkService.getBookmarkCount(),

  getBookmarksByBookUri: (bookUri: string) =>
    bookmarkService.getBookmarksByBookUri(bookUri),

  loadBookmarks: () => {
    set({ bookmarks: bookmarkService.getBookmarks() });
  },
}));
