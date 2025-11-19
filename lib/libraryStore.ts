import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { EPUBParser } from './EPUBParser';

// Define the shape of the library state
interface BookFile {
  name: string;
  uri: string;
  lastModified: number;
  size: number;
  author?: string;
  title? : string;
  coverImage?: string | null;
}

interface LibraryState {
  books: BookFile[];
  isLoading: boolean;
  isScanning: boolean;
  lastScanTime: number | null;
  loadCachedData: () => Promise<void>;
  saveDataToCache: (books: BookFile[]) => Promise<void>;
  scanAppDirectoryForBooks: (showAlert?: boolean) => Promise<void>;
  handleSelectBooks: () => Promise<void>;
  handleClearLibrary: () => Promise<void>;
  removeBook: (bookToRemove: BookFile) => Promise<void>;
}

// Zustand store
export const useLibraryStore = create<LibraryState>((set: (partial: Partial<LibraryState>) => void, get: () => LibraryState) => ({
  books: [],
  isLoading: false,
  isScanning: false,
  lastScanTime: null,

  loadCachedData: async () => {
    try {
      set({ isLoading: true });

      const cachedBooks = await AsyncStorage.getItem('books_cache');
      if (cachedBooks) {
        set({ books: JSON.parse(cachedBooks) });
      }

      const lastScan = await AsyncStorage.getItem('last_scan_time');
      if (lastScan) {
        set({ lastScanTime: parseInt(lastScan) });
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveDataToCache: async (books: BookFile[]) => {
    try {
      await AsyncStorage.setItem('books_cache', JSON.stringify(books));
      const now = Date.now();
      await AsyncStorage.setItem('last_scan_time', now.toString());
      set({ lastScanTime: now });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  },

  scanAppDirectoryForBooks: async (showAlert = true) => {
    try {
      set({ isScanning: true });
      const booksDir = `${FileSystem.documentDirectory}books/`;
      const dirInfo = await FileSystem.getInfoAsync(booksDir);

      if (!dirInfo.exists) {
        if (showAlert) {
          Alert.alert('No Books Directory', 'No books have been added to your library yet.');
        }
        return;
      }

      const folderContents = await FileSystem.readDirectoryAsync(booksDir);
      const epubFiles = folderContents.filter(file => file.toLowerCase().endsWith('.epub'));

      if (epubFiles.length === 0) {
        if (showAlert) {
          Alert.alert('No EPUB Files', 'No EPUB files found in your library.');
        }
        return;
      }

      const scannedBooks: BookFile[] = [];
      for (const fileName of epubFiles) {
        const fileUri = `${booksDir}${fileName}`;
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {

            var { coverImage, author, title }: { coverImage: string | null; author: string; title: string; } = await extractBookMetadata(fileUri, fileName);

            scannedBooks.push({
              name: fileName,
              uri: fileUri,
              lastModified: fileInfo.modificationTime || Date.now(),
              size: fileInfo.size || 0,
              coverImage: coverImage || null,
              author: author,
                title: title
            });
          }
        } catch (error) {
          console.error(`Error reading file ${fileName}:`, error);
        }
      }

      const uniqueBooks = scannedBooks.filter(
        (newBook) => !get().books.some((existingBook: BookFile) => existingBook.uri === newBook.uri)
      );

      const updatedBooks = [...get().books, ...uniqueBooks];
      set({ books: updatedBooks });
      await get().saveDataToCache(updatedBooks);

      if (showAlert && uniqueBooks.length > 0) {
        Alert.alert('New Books Found', `Found ${uniqueBooks.length} new books in your library!`);
      }
    } catch (error) {
      console.error('Error scanning app directory:', error);
      if (showAlert) {
        Alert.alert('Error', 'Failed to scan library for books.');
      }
    } finally {
      set({ isScanning: false });
    }
  },

  handleSelectBooks: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: 'application/epub+zip'
      });

      if (result.canceled !== true && 'assets' in result && result.assets.length > 0) {
        set({ isScanning: true });
        const newBooks: BookFile[] = [];

        for (const asset of result.assets) {
          try {
            const booksDir = `${FileSystem.documentDirectory}books/`;
            console.log(booksDir);
            
            const dirInfo = await FileSystem.getInfoAsync(booksDir);
            console.log(dirInfo);

            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
            }

            const destinationUri = `${booksDir}${asset.name}`;
            await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });

            console.log("AssetName: ", asset.name);
            
             var { coverImage, author, title }: { coverImage: string | null; author: string; title: string; } = await extractBookMetadata(destinationUri, asset.name);


            newBooks.push({
              name: asset.name,
              uri: destinationUri,
              lastModified: asset.lastModified || Date.now(),
              size: asset.size || 0,
              coverImage: coverImage || null,
              author: author,
                title: title
            });
          } catch (error) {
            console.error(`Error processing ${asset.name}:`, error);
          }
        }

        const uniqueBooks = newBooks.filter(
          (newBook) => !get().books.some((existingBook: BookFile) => existingBook.uri === newBook.uri)
        );

        const updatedBooks = [...get().books, ...uniqueBooks];
        set({ books: updatedBooks });
        await get().saveDataToCache(updatedBooks);

        Alert.alert('Books Added', `Successfully added ${uniqueBooks.length} new books to your library!`);
      }
    } catch (error) {
      console.error('Error selecting books:', error);
      Alert.alert('Error', 'Failed to add books to library.');
    } finally {
      set({ isScanning: false });
    }
  },

  handleClearLibrary: async () => {
    Alert.alert(
      'Clear Library',
      'Are you sure you want to clear your library? This will remove all books from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['books_cache', 'last_scan_time']);
              const booksDir = `${FileSystem.documentDirectory}books/`;
              const dirInfo = await FileSystem.getInfoAsync(booksDir);
              if (dirInfo.exists) {
                await FileSystem.deleteAsync(booksDir);
              }
              set({ books: [], lastScanTime: null });
              Alert.alert('Library Cleared', 'Your library has been cleared.');
            } catch (error) {
              console.error('Error clearing library:', error);
              Alert.alert('Error', 'Failed to clear library.');
            }
          }
        }
      ]
    );
  },

  removeBook: async (bookToRemove: BookFile) => {
    Alert.alert(
      'Remove Book',
      `Are you sure you want to remove "${bookToRemove.name}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(bookToRemove.uri);
              const updatedBooks = get().books.filter((book: BookFile) => book.uri !== bookToRemove.uri);
              set({ books: updatedBooks });
              await get().saveDataToCache(updatedBooks);
              Alert.alert('Book Removed', `"${bookToRemove.name}" has been removed from your library.`);
            } catch (error) {
              console.error('Error removing book:', error);
              Alert.alert('Error', 'Failed to remove book.');
            }
          }
        }
      ]
    );
  }
}));

async function extractBookMetadata(fileUri: string, fileName: string) {
  
  const parser = new EPUBParser(fileUri);
  const epubData = await parser.parse();

  const author = epubData.metadata.creator || 'Unknown Author';
  const title = epubData.metadata.title || fileName;
  const coverImage = await parser.getCoverImage();

  return { coverImage, author, title }; 

}
