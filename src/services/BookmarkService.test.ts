import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';
import BookmarkService from '@/src/services/BookmarkService';
import { makeBookmark } from '@/src/test/factories';

const KEY = 'bookmarks';

describe('BookmarkService', () => {
  beforeEach(() => {
    preferencesStorage.clearAll();
  });

  describe('addBookmark', () => {
    it('stores a bookmark with its book context', () => {
      const service = new BookmarkService();

      service.addBookmark(makeBookmark(), 'book.epub', 'Dune');

      const [bookmark] = service.getBookmarks();
      expect(bookmark.bookUri).toBe('book.epub');
      expect(bookmark.bookTitle).toBe('Dune');
      expect(typeof bookmark.createdAt).toBe('number');
      expect(service.getBookmarkCount()).toBe(1);
    });

    it('persists to storage and reloads', () => {
      new BookmarkService().addBookmark(makeBookmark(), 'book.epub', 'Dune');

      expect(new BookmarkService().getBookmarkCount()).toBe(1);
    });
  });

  describe('removeBookmark', () => {
    it('removes by id and leaves the rest alone', () => {
      const service = new BookmarkService();
      service.addBookmark(makeBookmark({ id: 'a' } as never), 'x.epub', 'X');
      service.addBookmark(makeBookmark({ id: 'b' } as never), 'x.epub', 'X');

      service.removeBookmark(makeBookmark({ id: 'a' } as never));

      expect(service.getBookmarkCount()).toBe(1);
      expect(service.getBookmarks()[0].id).toBe('b');
    });
  });

  describe('isBookmarked', () => {
    it('reports membership by id', () => {
      const service = new BookmarkService();
      service.addBookmark(makeBookmark({ id: 'a' } as never), 'x.epub', 'X');

      expect(service.isBookmarked(makeBookmark({ id: 'a' } as never))).toBe(
        true
      );
      expect(service.isBookmarked(makeBookmark({ id: 'z' } as never))).toBe(
        false
      );
    });
  });

  describe('getBookmarksByBookUri', () => {
    it('scopes to one book', () => {
      const service = new BookmarkService();
      service.addBookmark(makeBookmark({ id: 'a' } as never), 'x.epub', 'X');
      service.addBookmark(makeBookmark({ id: 'b' } as never), 'y.epub', 'Y');

      expect(service.getBookmarksByBookUri('x.epub')).toHaveLength(1);
    });
  });

  describe('clearBookmarks', () => {
    it('empties memory and storage', () => {
      const service = new BookmarkService();
      service.addBookmark(makeBookmark(), 'x.epub', 'X');

      service.clearBookmarks();

      expect(service.isEmpty()).toBe(true);
      expect(preferencesStorage.getString(KEY)).toBeUndefined();
    });
  });

  describe('deleteBookmarkById', () => {
    it('compares ids as strings', () => {
      const service = new BookmarkService();
      service.addBookmark(makeBookmark({ id: 42 } as never), 'x.epub', 'X');

      service.deleteBookmarkById('42');

      expect(service.isEmpty()).toBe(true);
    });
  });

  describe('backfillCreatedAt', () => {
    it('adds createdAt to legacy records that lack it', () => {
      preferencesStorage.set(
        KEY,
        JSON.stringify([{ id: 'legacy-1', bookUri: 'x.epub', cfi: 'cfi' }])
      );

      const service = new BookmarkService();

      expect(service.getBookmarks()[0].createdAt).toBeDefined();
      // and it is written back
      expect(
        JSON.parse(preferencesStorage.getString(KEY)!)[0].createdAt
      ).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------
  // BUG-30: the constructor calls JSON.parse on the stored payload with no
  // try/catch. A truncated or corrupted MMKV value therefore throws while the
  // service is being constructed, which takes the whole app's boot down rather
  // than degrading to "no bookmarks".
  // ---------------------------------------------------------------------
  describe('BUG-30: corrupt stored bookmarks crash the constructor', () => {
    it.todo(
      'constructing with a corrupt payload yields an empty list, not a throw'
    );

    it.todo('constructing with a non-array payload yields an empty list');
  });
});
