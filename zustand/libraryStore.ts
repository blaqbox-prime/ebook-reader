
import { create } from 'zustand';
import Book from "@/db/models/Book";
import {Q} from "@nozbe/watermelondb";
import db from "@/db/index.native"

interface LibraryState {
    books: Book[];
    isLoading: boolean;
    filteredBooks: Book[];
    setFilteredBooks: (books: Book[]) => void;
    setBooks: (books: Book[]) => void;
    // ... other state properties
}

export const useLibraryStore = create<LibraryState>((set) => ({
    books: [],
    isLoading: true,
    filteredBooks: [],
    setBooks: (books) => set({ books, isLoading: false }),
    setFilteredBooks: (books) => set({ filteredBooks: books }),
}));


// --- UTILITY TO SUBSCRIBE TO THE DATABASE ---

/**
 * Sets up a live synchronization between WatermelonDB and the Zustand store.
 */
export const startLibrarySync = () => {
    // 1. Define the live query
    const booksObservable = db.get<Book>('books')
        .query(Q.sortBy('updated_at', Q.desc)) // Sort by when the book was last modified
        .observe(); // .observe() returns the Observable

    // 2. Subscribe to the observable
    const subscription = booksObservable.subscribe((latestBooks: Book[]) => {
        // This callback fires immediately with current data, and again every time data changes
        // console.log(`WatermelonDB detected ${latestBooks.length} books. Updating store.`);
        useLibraryStore.getState().setBooks(latestBooks);
        useLibraryStore.getState().setFilteredBooks(latestBooks);
    });

    // Return the unsubscribe function so we can clean up the listener later
    return () => subscription.unsubscribe();
};