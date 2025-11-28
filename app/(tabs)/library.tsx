import { images } from "@/assets";
import BookTile from "@/components/BookTile";
import EmptyStateView from "@/components/EmptyStateView";
import SearchBox from "@/components/SearchBox";
import { colors } from "@/constants/constants";
import { fetchBooks } from "@/lib/storageUtils";
import { handleSelectBooks, scanAppDirectoryForBooks } from "@/lib/utils";
import { useLibraryStore } from "@/zustand/libraryStore";
import { ReaderProvider } from "@epubjs-react-native/core";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { PulseIndicator } from "react-native-indicators";
import { SafeAreaView } from "react-native-safe-area-context";

const library = () => {
  const [searchText, setSearchText] = useState<string | null>("");

  const {
    books,
    isLoading,
    isScanning,
      setLoading,
    addBooks
  } = useLibraryStore();

  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);

  useEffect(() => {
    
    const init = async () => {
      setLoading(true)
      const storedBooks = await fetchBooks()
      if(storedBooks.length > 0){
        addBooks(storedBooks)
      } else {
        await scanAppDirectoryForBooks()
      }
      setFilteredBooks(books)
      setLoading(false)
    }

    init()

  }, []);

  const handleSearch = (text: string) => {
    if (text.trim().length == 0) {
      setFilteredBooks(books);
      return;
    }
    setFilteredBooks(
      filteredBooks.filter((book) =>
        book.title?.toLowerCase().includes(text.toLowerCase())
      )
    );
  };


  if (isLoading || isScanning) {
    return (
      <SafeAreaView className="flex flex-1 items-center justify-center gap-4">
        <View>
          <PulseIndicator color={colors.primary} />
          <Text className="text-dark">Loading Library</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ReaderProvider>
      <SafeAreaView className="flex flex-1 px-8 py-6">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-3xl font-lato-bold">Library</Text>
          <TouchableOpacity onPress={handleSelectBooks}>
            <Text className="text-primary">Add books</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-col flex-1 mt-6">
          <Animated.FlatList
            data={filteredBooks}
            extraData={filteredBooks}
            numColumns={2}
            keyExtractor={(bookfile) => bookfile.uri}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
               <BookTile book={item} />
              );
            }}
            ListHeaderComponent={
              <SearchBox onChangeText={handleSearch}/>
            }
            ListHeaderComponentStyle={{
              marginBottom: 12,
            }}
            ListEmptyComponent={
              <EmptyStateView image={images.BOOKSHELF} message={"No books available."} />
            }
            refreshing={isScanning}
            onRefresh={scanAppDirectoryForBooks}
          />
        </View>
      </SafeAreaView>
    </ReaderProvider>
  );
};

export default library;
