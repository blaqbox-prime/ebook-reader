import { images } from "@/assets";
import { BookTile, EmptyStateView, SearchBox } from "@/src/components";
import watermelondb from "@/src/data/watermelondb";
import { Book } from "@/src/data/watermelondb/models";
import BookRepository from "@/src/repositories/BookRepository";
import Feather from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { PulseIndicator } from "react-native-indicators";
import { SafeAreaView } from "react-native-safe-area-context";

const Library = () => {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(false);

    const handleSearch = (text: string) => {};

    const handleAddBooks = async () => {}

    const handleRefresh = async () => {}

    useEffect(() => {
    const fetchAllBooks = async () => {
    setLoading(true);
    
    try{
      const repo = new BookRepository(watermelondb);
      const dbBooks = await repo.getAllBooks();
      setBooks(dbBooks);
    }
    catch(error){
      console.log(error);
      Alert.alert("Error", "Failed to fetch books from database.");
    }
    setLoading(false);
  }

    fetchAllBooks();

  }, [])


    if (loading) {
        return (
            <LoadingPulse key={"pulse"}/>
        );
    }

    return (
            <SafeAreaView className="flex flex-1 px-8 py-6">
                <View className="flex flex-row items-center justify-between">
                    <Text className="text-3xl font-lato-regular ">Library</Text>
                    <View className="flex flex-row items-center gap-4">
                        <TouchableOpacity onPress={handleAddBooks}>
                            <Text className="text-primary">Add books</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-col flex-1 mt-6">
                    <Animated.FlatList
                        data={books}
                        extraData={books}
                        numColumns={2}
                        horizontal={false}
                        keyExtractor={(bookfile) => bookfile.uri}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            return (
                                <View className="w-1/2 p-2" key={item.id}>
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
                            <EmptyStateView image={images.bookshelf} message={"No books available."}
                                showButton={true}
                                            buttonText={"Add Books"}
                                            buttonIcon={<Feather name={"plus"} size={24} color="white" />}
                                            buttonAction={handleAddBooks}

                            />
                        }
                        refreshing={loading}
                        onRefresh={handleRefresh}
                    />
                </View>
            </SafeAreaView>
    );
};

export default Library;


function LoadingPulse() {
    return <SafeAreaView className="flex flex-1 items-center justify-center gap-4">
        <View>
            <PulseIndicator size={24} />
            <Text className="text-black">Loading Library</Text>
        </View>
    </SafeAreaView>;
}

