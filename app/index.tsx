// import { preferencesStorage, watermelondb } from "@/src/data";
// import { Book } from "@/src/data/watermelondb/models";
import { watermelondb } from "@/src/data";
import { Book } from "@/src/data/watermelondb/models";
import BookRepository from "@/src/repositories/BookRepository";
import { BookScanner } from "@/src/services";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { PulseIndicator } from "react-native-indicators";


export default function Index() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false);
  
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



  return (
    <View>
      <Text className="text-orange-900">Books in Database: {books.length}</Text>
      <TouchableOpacity className="bg-blue-600 h-12 m-6 items-center justify-center rounded shadow-md" onPress={() => {}} >
        {loading ? (
          <PulseIndicator color="white" size={24} />
        ) : (
          <Text className="text-white font-bold">Fetch All Books</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
