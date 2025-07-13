import { filterDuplicateBookFiles } from '@/lib/utils';
import { useFileSystem } from '@epubjs-react-native/expo-file-system'; // for Expo project
import * as DocumentPicker from 'expo-document-picker';
import { Link } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const Library = () => {

  const filesystem = useFileSystem();

  console.log(filesystem.documentDirectory)
  const [books, setBooks] = useState<BookFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectFolder = useCallback(
   async () => {
      console.log("clicked")
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true, type: "application/epub+zip" })

      if(result.canceled === false && result.assets && result.assets.length > 0){
        const newBooks: BookFile[] = result.assets.map(bookFile => ({name: bookFile.name, uri: bookFile.uri, lastModified:bookFile.lastModified, size: bookFile.size}))
        const uniqueBookFiles: BookFile[] = filterDuplicateBookFiles(books, newBooks);
        setBooks((prevBookFiles) => [...prevBookFiles, ...uniqueBookFiles])
        Alert.alert('Books Added', `Successfully added ${uniqueBookFiles.length} new books to your library!`);
      }
      else {
        console.log('Document picking cancelled or no files selected.');
        Alert.alert('Selection Cancelled', 'No EPUB files were selected.');
      }

    },
    [books],
  )


  return (
    <SafeAreaView className='flex flex-1 p-5'>

      <View className='flex flex-row items-center justify-between'>
        <Text className='text-3xl font-lato-bold'>Library</Text>
        <TouchableOpacity onPress={handleSelectFolder}>
          <Text className='text-primary'>Select books folder</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        data={books}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity>
          <Link href={{pathname:"/reader/[uri]", params: {uri: item.uri}}} >
              <View className='flex gap-2'>
            <Text className='text-2xl font-bold text-dark'>{item.name}</Text>
            <Text className='text-light'>{item.uri}</Text>
          </View>
          </Link>
            </TouchableOpacity>
          )
        }}
      />

    </SafeAreaView>
  )
}

export default Library