import { preferencesStorage } from '@/src/data';
import { Bookmark } from '@epubjs-react-native/core';
import { BookmarkWithContext } from '@/src/types/reader.types';

class BookmarkService {
  private bookmarks: BookmarkWithContext[] = [];
  private storageKey = 'bookmarks';
  private storage = preferencesStorage;

  constructor() {
    const storedBookmarks = this.storage.getString(this.storageKey);
    if (storedBookmarks) {
      this.bookmarks = JSON.parse(storedBookmarks);
    }
  }

  addBookmark = (bookmark: Bookmark, bookUri: string, bookTitle: string) => {
    const bookmarkWithContext: BookmarkWithContext = {
      ...bookmark,
      bookUri,
      bookTitle,
    };
    this.bookmarks.push(bookmarkWithContext);
    this.storage.set(this.storageKey, JSON.stringify(this.bookmarks));
  };

  getBookmarks = () => {
    return this.bookmarks;
  };

  removeBookmark = (bookmark: Bookmark) => {
    this.bookmarks = this.bookmarks.filter(b => b.id !== bookmark.id);
    this.storage.set(this.storageKey, JSON.stringify(this.bookmarks));
  };

  clearBookmarks = () => {
    this.bookmarks = [];
    this.storage.remove(this.storageKey);
  };

  isBookmarked = (bookmark: Bookmark) => {
    return this.bookmarks.some(b => b.id === bookmark.id);
  };

  getBookmarkCount = () => {
    return this.bookmarks.length;
  };

  getBookmarksByBookUri = (bookUri: string) => {
    return this.bookmarks.filter(bookmark => bookmark.bookUri === bookUri);
  };

  isEmpty = () => {
    return this.bookmarks.length === 0;
  };

  deleteBookmarkById(bookmarkId: string) {
    this.bookmarks = this.bookmarks.filter(
      bookmark => bookmark.id.toString() !== bookmarkId
    );
    this.storage.set(this.storageKey, JSON.stringify(this.bookmarks));
  }
}

export default BookmarkService;
