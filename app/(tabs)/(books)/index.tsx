import { images } from "@/assets";
import BookTile from "@/components/BookTile";
import EmptyStateView from "@/components/EmptyStateView";
import SearchBox from "@/components/SearchBox";
import SortButton from "@/components/SortButton";
import { colors } from "@/constants/constants";
import Book from "@/db/models/Book";
import { fetchAllBooks } from "@/db/queries";
import { storeBooks } from "@/lib/storageUtils";
import { handleSelectBooks } from "@/lib/utils";
import { useLibraryStore } from "@/zustand/libraryStore";
import { ReaderProvider } from "@epubjs-react-native/core";
import {useEffect, useLayoutEffect, useState} from "react";
import {
    Animated,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PulseIndicator } from "react-native-indicators";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import {useLayout} from "@gluestack-ui/utils";

const Library = () => {

    const {
        books,
        isLoading,
        filteredBooks, setFilteredBooks,
    } = useLibraryStore();

    // useEffect(() => {
    //     setFilteredBooks(books)
    // }, [books]);

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

    const handleAddBooks = async () => {

        const selectedBooks = await handleSelectBooks()
        await storeBooks(selectedBooks || []);
    }

    const handleRefresh = async () => {
        const dbBooks = await fetchAllBooks()
        setFilteredBooks(dbBooks)
    }


    if (isLoading) {
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
                    <Text className="text-3xl font-lato-regular ">Library</Text>
                    <View className="flex flex-row items-center gap-4">
                        <TouchableOpacity onPress={handleAddBooks}>
                            <Text className="text-primary">Add books</Text>
                        </TouchableOpacity>
                            <SortButton />
                    </View>
                </View>

                <View className="flex flex-col flex-1 mt-6">
                    <Animated.FlatList
                        data={filteredBooks}
                        extraData={filteredBooks}
                        numColumns={2}
                        horizontal={false}
                        keyExtractor={(bookfile) => bookfile.uri}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            return (
                                <View className="w-1/2 p-2">
                                    <BookTile book={item} />
                                </View>
                            );
                        }}
                        ListHeaderComponent={
                            <SearchBox onChangeText={handleSearch}/>
                        }
                        ListHeaderComponentStyle={{
                            marginBottom: 24,
                        }}
                        ListFooterComponent={
                            <View className="h-20"></View>
                        }
                        ListEmptyComponent={
                            <EmptyStateView image={images.BOOKSHELF} message={"No books available."}
                                showButton={true}
                                            buttonText={"Add Books"}
                                            buttonIcon={<Feather name={"plus"} size={24} color={colors.light}/>}
                                            buttonAction={handleAddBooks}

                            />
                        }
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                    />
                </View>
            </SafeAreaView>
        </ReaderProvider>
    );
};

export default Library;
