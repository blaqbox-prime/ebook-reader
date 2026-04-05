import { create } from 'zustand';
import { Bookmark } from '@epubjs-react-native/core';
import BookmarkService from '@/src/services/BookmarkService';

interface BookmarksState {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark, bookUri: string, bookTitle: string) => void;
  removeBookmark: (bookmark: Bookmark) => void;
  clearBookmarks: () => void;
  getBookmarks: () => Bookmark[];
  isBookmarked: (bookmark: Bookmark) => boolean;
  getBookmarkCount: () => number;
  getBookmarksByBookUri: (bookUri: string) => Bookmark[];
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

  isBookmarked: (bookmark: Bookmark) => bookmarkService.isBookmarked(bookmark),

  getBookmarkCount: () => bookmarkService.getBookmarkCount(),

  getBookmarksByBookUri: (bookUri: string) =>
    bookmarkService.getBookmarksByBookUri(bookUri),

  loadBookmarks: () => {
    set({ bookmarks: bookmarkService.getBookmarks() });
  },
}));
