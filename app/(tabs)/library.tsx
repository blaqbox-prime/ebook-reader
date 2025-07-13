import { colors } from '@/constants/constants';
import { filterDuplicateBookFiles } from '@/lib/utils';
import { useFileSystem } from '@epubjs-react-native/expo-file-system'; // for Expo project
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Animated, AppState, Text, TouchableOpacity, View } from 'react-native';
import {
  PulseIndicator
} from 'react-native-indicators';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEYS = {
  FOLDER_URI: 'selected_folder_uri',
  BOOKS_CACHE: 'books_cache',
  LAST_SCAN_TIME: 'last_scan_time'
};

const Library = () => {

  const filesystem = useFileSystem();
  const [books, setBooks] = useState<BookFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFolderUri, setSelectedFolderUri] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);
// Load cached data on component mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Listen for app state changes to auto-scan when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && books.length > 0) {
        // Check if we should auto-scan (if last scan was more than 5 minutes ago)
        const now = Date.now();
        if (!lastScanTime || (now - lastScanTime) > 5 * 60 * 1000) {
          handleQuickScan();
        }
      }
    });

    return () => subscription?.remove();
  }, [books, lastScanTime]);

  const loadCachedData = async () => {
    try {
      setIsLoading(true);
      
      // Load cached books
      const cachedBooks = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS_CACHE);
      if (cachedBooks) {
        setBooks(JSON.parse(cachedBooks));
      }

      // Load last scan time
      const lastScan = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN_TIME);
      if (lastScan) {
        setLastScanTime(parseInt(lastScan));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDataToCache = async (books: BookFile[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS_CACHE, JSON.stringify(books));
      const now = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN_TIME, now.toString());
      setLastScanTime(now);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const copyFileToAppDirectory = async (sourceUri: string, fileName: string): Promise<string> => {
    try {
      // Create a books directory in the app's document directory
      const booksDir = `${FileSystem.documentDirectory}books/`;
      const dirInfo = await FileSystem.getInfoAsync(booksDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
      }

      const destinationUri = `${booksDir}${fileName}`;
      
      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      if (fileInfo.exists) {
        return destinationUri; // Return existing file path
      }

      // Copy file to app directory
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });

      return destinationUri;
    } catch (error) {
      console.error('Error copying file to app directory:', error);
      throw error;
    }
  };

  const scanAppDirectoryForBooks = async (showAlert: boolean = true) => {
    try {
      setIsScanning(true);
      const booksDir = `${FileSystem.documentDirectory}books/`;
      const dirInfo = await FileSystem.getInfoAsync(booksDir);
      
      if (!dirInfo.exists) {
        if (showAlert) {
          Alert.alert('No Books Directory', 'No books have been added to your library yet.');
        }
        return;
      }

      const folderContents = await FileSystem.readDirectoryAsync(booksDir);
      const epubFiles = folderContents.filter(file => 
        file.toLowerCase().endsWith('.epub')
      );

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
            scannedBooks.push({
              name: fileName,
              uri: fileUri,
              lastModified: fileInfo.modificationTime || Date.now(),
              size: fileInfo.size || 0
            });
          }
        } catch (error) {
          console.error(`Error reading file ${fileName}:`, error);
        }
      }

      // Update books list with scanned books
      const uniqueBookFiles: BookFile[] = filterDuplicateBookFiles(books, scannedBooks);
      const updatedBooks = [...books, ...uniqueBookFiles];
      
      setBooks(updatedBooks);
      await saveDataToCache(updatedBooks);

      if (showAlert && uniqueBookFiles.length > 0) {
        Alert.alert('New Books Found', `Found ${uniqueBookFiles.length} new books in your library!`);
      }
    } catch (error) {
      console.error('Error scanning app directory:', error);
      if (showAlert) {
        Alert.alert('Error', 'Failed to scan library for books.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectBooks = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        copyToCacheDirectory: true, 
        multiple: true,
        type: 'application/epub+zip'
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setIsScanning(true);
        const newBooks: BookFile[] = [];
        
        for (const asset of result.assets) {
          try {
            // Copy each selected file to the app's books directory
            const copiedUri = await copyFileToAppDirectory(asset.uri, asset.name);
            
            newBooks.push({
              name: asset.name,
              uri: copiedUri,
              lastModified: asset.lastModified || Date.now(),
              size: asset.size || 0
            });
          } catch (error) {
            console.error(`Error processing ${asset.name}:`, error);
          }
        }

        if (newBooks.length > 0) {
          const uniqueBookFiles: BookFile[] = filterDuplicateBookFiles(books, newBooks);
          const updatedBooks = [...books, ...uniqueBookFiles];
          
          setBooks(updatedBooks);
          await saveDataToCache(updatedBooks);
          
          Alert.alert('Books Added', `Successfully added ${uniqueBookFiles.length} new books to your library!`);
        }
      } else {
        console.log('Document picking cancelled or no files selected.');
      }
    } catch (error) {
      console.error('Error selecting books:', error);
      Alert.alert('Error', 'Failed to add books to library.');
    } finally {
      setIsScanning(false);
    }
  }, [books]);

  const handleQuickScan = useCallback(async () => {
    await scanAppDirectoryForBooks(false); // Silent scan
  }, [books]);

  const handleRescanLibrary = useCallback(async () => {
    await scanAppDirectoryForBooks(true);
  }, []);

  const handleClearLibrary = useCallback(async () => {
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
              // Clear cached data
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.BOOKS_CACHE,
                STORAGE_KEYS.LAST_SCAN_TIME
              ]);
              
              // Remove books directory
              const booksDir = `${FileSystem.documentDirectory}books/`;
              const dirInfo = await FileSystem.getInfoAsync(booksDir);
              if (dirInfo.exists) {
                await FileSystem.deleteAsync(booksDir);
              }
              
              setBooks([]);
              setLastScanTime(null);
              Alert.alert('Library Cleared', 'Your library has been cleared.');
            } catch (error) {
              console.error('Error clearing library:', error);
              Alert.alert('Error', 'Failed to clear library.');
            }
          }
        }
      ]
    );
  }, []);

  const removeBook = useCallback(async (bookToRemove: BookFile) => {
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
              // Remove file from filesystem
              await FileSystem.deleteAsync(bookToRemove.uri);
              
              // Remove from books list
              const updatedBooks = books.filter(book => book.uri !== bookToRemove.uri);
              setBooks(updatedBooks);
              await saveDataToCache(updatedBooks);
              
              Alert.alert('Book Removed', `"${bookToRemove.name}" has been removed from your library.`);
            } catch (error) {
              console.error('Error removing book:', error);
              Alert.alert('Error', 'Failed to remove book.');
            }
          }
        }
      ]
    );
  }, [books]);

  if (isLoading) return (
    <SafeAreaView className='flex flex-1 items-center justify-center gap-4'>
      <View>
        <PulseIndicator color={colors.primary}/>
        <Text>Loading Library</Text>
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView className='flex flex-1 p-5'>

      <View className='flex flex-row items-center justify-between'>
        <Text className='text-3xl font-lato-bold'>Library</Text>
        <TouchableOpacity onPress={handleSelectBooks}>
          <Text className='text-primary'>Select books folder</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={books}
        numColumns={2}
        columnWrapperStyle={{justifyContent: "space-between"}}
        keyExtractor={(bookfile) => bookfile.uri}
        renderItem={({ item }) => {
          return (
            <View className='mb-4 bg-white w-[48%] rounded-lg shadow-sm overflow-hidden'>
              <Link href={{pathname:"/reader/[uri]", params: {uri: item.uri}}} asChild>
                <TouchableOpacity className='p-4'>
                  <Text className='text-lg font-lato-bold text-dark mb-2' numberOfLines={2}>
                    {item.name.replace('.epub', '')}
                  </Text>
                  {item.size && <Text className='text-sm text-gray-500 mb-1'>
                    Size: {(item.size / 1024 / 1024).toFixed(2)} MB
                  </Text>}
                  <Text className='text-xs text-gray-400'>
                    5
                  </Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity 
                onPress={() => removeBook(item)}
                className='bg-red-50 px-4 py-2 border-t border-red-100'
              >
                <Text className='text-red-500 text-sm text-center'>Remove</Text>
              </TouchableOpacity>
            </View>
          )
        }}
      />

    </SafeAreaView>
  )
}

export default Library