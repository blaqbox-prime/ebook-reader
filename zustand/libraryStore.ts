// store/libraryStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { alertNoBooksDir, alertNoEpubs, BOOKS_DIR, createBookFromFile, ensureBooksDirectory, filterDuplicateBookFiles, filterNewBooks, getEpubFilesInDirectory } from '../lib/utils';

export const STORAGE_KEYS = {
  LIBRARY: 'library',
  BOOKS_CACHE: 'books_cache',
  LAST_SCAN: 'last_scan_time',
};

interface LibraryState {
  books: BookFile[];
  isLoading: boolean;
  isScanning: boolean;
  lastScanTime: number | null;
  // loadCachedData: () => Promise<void>;
  addBooks: (books: BookFile[]) => void;
  scanAppDirectoryForBooks: (showAlert?: any) => Promise<void>;
  handleSelectBooks: () => Promise<void>;
  handleClearLibrary: () => Promise<void>;
  removeBook: (bookToRemove: BookFile) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: [],
      isLoading: false,
      isScanning: false,
      lastScanTime: null,

      addBooks: (newBooks) => {
         const uniqueBooks = filterDuplicateBookFiles(get().books, newBooks);
        set((state) => ({books: [...state.books, ...uniqueBooks], lastScanTime: Date.now()}));
      },

      scanAppDirectoryForBooks: async (showAlert = true) => {
        try {
          set({ isScanning: true });
          const dirInfo = await ensureBooksDirectory();
          if (!dirInfo.exists) return showAlert && alertNoBooksDir();

          const epubFiles = await getEpubFilesInDirectory(BOOKS_DIR);
          if (epubFiles.length === 0) return showAlert && alertNoEpubs();

          const scannedBooks = await Promise.all(
            epubFiles.map((file) => createBookFromFile(`${BOOKS_DIR}${file}`, file))
          );

          const uniqueBooks = filterNewBooks(scannedBooks, get().books);
          const updatedBooks = [...get().books, ...uniqueBooks];
          set({ books: updatedBooks, lastScanTime: Date.now() });

          if (showAlert && uniqueBooks.length > 0) {
            Alert.alert('New Books Found', `Found ${uniqueBooks.length} new books in your library!`);
          }
        } catch (error) {
          console.error('Error scanning app directory:', error);
          showAlert && Alert.alert('Error', 'Failed to scan library for books.');
        } finally {
          set({ isScanning: false });
        }
      },

      handleSelectBooks: async () => {
        try {
          const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            multiple: true,
            type: 'application/epub+zip',
          });

          if (result.canceled || !('assets' in result)) return;

          set({ isScanning: true });
          const newBooks = await Promise.all(
            result.assets.map(async (asset) => {
              const destinationUri = `${BOOKS_DIR}${asset.name}`;
              await ensureBooksDirectory();
              await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });
              return createBookFromFile(destinationUri, asset.name, asset);
            })
          );

          const uniqueBooks = filterNewBooks(newBooks, get().books);
          const updatedBooks = [...get().books, ...uniqueBooks];
          set({ books: updatedBooks, lastScanTime: Date.now() });

          Alert.alert('Books Added', `Successfully added ${uniqueBooks.length} new books to your library!`);
        } catch (error) {
          console.error('Error selecting books:', error);
          Alert.alert('Error', 'Failed to add books to library.');
        } finally {
          set({ isScanning: false });
        }
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
    {
      name: STORAGE_KEYS.LIBRARY,
      storage: createJSONStorage(() => AsyncStorage),

    }
  )
);