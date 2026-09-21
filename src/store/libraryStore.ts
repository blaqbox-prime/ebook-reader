import { create } from 'zustand';
import { Book } from '@/src/data/watermelondb/models';
import BookService from '@/src/services/BookService';
import { BookScanner } from '@/src/utils';

interface LibraryState {
  books: Book[];
  loading: boolean;
  refreshing: boolean;
  allBooks: Book[]; // Store all books for search fallback
  fetchBooks: () => Promise<void>;
  searchBooks: (text: string) => void;
  addBooks: () => Promise<void>;
  refreshBooks: () => Promise<void>;
}

const bookService = new BookService();
const bookScanner = new BookScanner();

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  loading: false,
  refreshing: false,
  allBooks: [],

  fetchBooks: async () => {
    set({ loading: true });
    try {
      const dbBooks = await bookService.getBooks();
      set({ books: dbBooks, allBooks: dbBooks });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  searchBooks: (text: string) => {
    if (text.trim().length > 0) {
      const allBooks = get().allBooks;
      const filteredBooks = allBooks.filter(
        book =>
          book.title.toLowerCase().includes(text.toLowerCase()) ||
          book.author.toLowerCase().includes(text.toLowerCase())
      );
      set({ books: filteredBooks });
    } else {
      // If search text is empty, show all books
      set({ books: get().allBooks });
    }
  },

  addBooks: async () => {
    try {
      const addedBooks = await bookScanner.AddBooksFromFileStorage();
      await bookService.saveScannedBooksWithMetadata(addedBooks);
      await get().fetchBooks();
    } catch (error) {
      console.error(error);
    }
  },

  refreshBooks: async () => {
    set({ refreshing: true });
    try {
      const scannedBooks = await bookScanner.scanAppDirectory();
      await bookService.saveScannedBooksWithMetadata(scannedBooks);
      await get().fetchBooks();
    } catch (error) {
      console.error(error);
    } finally {
      set({ refreshing: false });
    }
  },
}));
