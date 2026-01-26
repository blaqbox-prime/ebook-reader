import { preferencesStorage, watermelondb } from "@/src/data";
import { Book } from "@/src/data/watermelondb/models";
import { useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function Index() {
  const [books, setBooks] = useState<Book[]>([])
  const fetchAllBooks = async () => {
    const db_books: Book[] = await watermelondb.get<Book>('books').query().fetch()
    setBooks(db_books);
  }


  return (
    <View>
      <Text className="text-orange-900">Books in WatermelonDB: {books.length}</Text>
      <TouchableOpacity className="bg-blue-600 p-3 m-6" onPress={fetchAllBooks} >
        <Text className=" text-white font-bold">Fetch all books</Text>
      </TouchableOpacity>
    </View>
  );
}
