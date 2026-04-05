import { preferencesStorage } from '@/src/data';
import { Bookmark } from '@epubjs-react-native/core';

class BookmarkService {
  private bookmarks: Bookmark[] = [];
  private storageKey = 'bookmarks';
  private storage = preferencesStorage;

  constructor() {
    const storedBookmarks = this.storage.getString(this.storageKey);
    if (storedBookmarks) {
      this.bookmarks = JSON.parse(storedBookmarks);
    }
  }

  addBookmark = (bookmark: Bookmark, bookUri: string, bookTitle: string) => {
    (bookmark as any).bookUri = bookUri;
    (bookmark as any).bookTitle = bookTitle;
    this.bookmarks.push(bookmark);
    this.storage.set(this.storageKey, JSON.stringify(this.bookmarks));
  };

  getBookmarks = () => {
    return this.bookmarks;
  };

  removeBookmark = (bookmark: Bookmark) => {
    this.bookmarks = this.bookmarks.filter(b => b !== bookmark);
    this.storage.set(this.storageKey, JSON.stringify(this.bookmarks));
  };

  clearBookmarks = () => {
    this.bookmarks = [];
    this.storage.remove(this.storageKey);
  };

  isBookmarked = (bookmark: Bookmark) => {
    return this.bookmarks.includes(bookmark);
  };

  getBookmarkCount = () => {
    return this.bookmarks.length;
  };

  getBookmarksByBookUri = (bookUri: string) => {
    return this.bookmarks.filter(
      (bookmark: Bookmark) => (bookmark as any).bookUri === bookUri
    );
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
