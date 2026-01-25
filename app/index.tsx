import { preferencesStorage, watermelondb } from "@/src/data";
import { Book } from "@/src/data/watermelondb/models";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";


export default function Index() {
  const [books, setBooks] = useState<Book[]>([])
  const fetchAllBooks = async () => {
    const db_books: Book[] = await watermelondb.get<Book>('books').query().fetch()
    setBooks(db_books);
  }


  return (
    <View>
      <Text>Books in WatermelonDB: {books.length}</Text>
      <Button title="Fetch all books" onPress={fetchAllBooks} />
    </View>
  );
}
