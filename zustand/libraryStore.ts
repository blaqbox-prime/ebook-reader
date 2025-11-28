// store/libraryStore.ts
import { STORAGE_KEYS } from '@/lib/storageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { BOOKS_DIR, filterDuplicateBookFiles } from '../lib/utils';


interface LibraryState {
  books: BookFile[];
  isLoading: boolean;
  isScanning: boolean;
  lastScanTime: number | null;
  setLoading: (value: boolean) => void
  addBooks: (books: BookFile[]) => void;
  handleClearLibrary: () => Promise<void>;
  removeBook: (bookToRemove: BookFile) => Promise<void>;
}


export const useLibraryStore = create<LibraryState>()(
  
    (set, get) => ({
      books: [],
      isLoading: false,
      isScanning: false,
      lastScanTime: null,

      addBooks: async (newBooks) => {
         const uniqueBooks = filterDuplicateBookFiles(get().books, newBooks);
        set((state) => ({books: [...state.books, ...uniqueBooks], lastScanTime: Date.now()}));
      },

      setLoading: (value: boolean) => {
        set({isLoading: value})
      },

      handleClearLibrary: async () => {
        Alert.alert('Clear Library', 'Are you sure you want to clear your library?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.multiRemove([STORAGE_KEYS.BOOKS_CACHE, STORAGE_KEYS.LAST_SCAN]);
                const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
                if (dirInfo.exists) await FileSystem.deleteAsync(BOOKS_DIR);
                set({ books: [], lastScanTime: null });
                Alert.alert('Library Cleared', 'Your library has been cleared.');
              } catch (error) {
                console.error('Error clearing library:', error);
                Alert.alert('Error', 'Failed to clear library.');
              }
            },
          },
        ]);
      },

      removeBook: async (bookToRemove) => {
        Alert.alert('Remove Book', `Remove "${bookToRemove.name}" from your library?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await FileSystem.deleteAsync(bookToRemove.uri);
                const updatedBooks = get().books.filter((b) => b.uri !== bookToRemove.uri);
                set({ books: updatedBooks });

                Alert.alert('Book Removed', `"${bookToRemove.name}" has been removed.`);
              } catch (error) {
                console.error('Error removing book:', error);
                Alert.alert('Error', 'Failed to remove book.');
              }
            },
          },
        ]);
      },
    }),

);

