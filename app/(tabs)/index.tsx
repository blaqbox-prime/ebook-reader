import db from '@/db/index.native';
import Book from '@/db/models/Book';
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  const [books, setbooks] = useState<Book[]>([])

  
  const viewTable = async () => {
    const booksCollection = db.get<Book>('books').query().fetchCount()
    console.log("count = " + (await booksCollection).toLocaleString())
  }  

  const createNewBook = async () => {
  // 1. Await db.write and capture the result of the returned action.
  // The function passed to db.write must be asynchronous.
  const newBook = await db.write(
    async () => {
      return db.get<Book>('books').create((b: Book) => {
        b.uri = "test uri";
        b.creator = "owner";
        b.coverImage = "A picture here";
        b.title = "testing title";
      });
    }
  );

  if (!newBook) {
    return null;
  } else {
    return newBook;
  }
}
  
  

  return (
    <SafeAreaView className='mx-4'>
      <View>
          <Text>List of Books</Text>
      </View>

      <Button title='Add Book Sample' onPress={createNewBook}/>
      <Button title='Results' onPress={viewTable}/>

      <View>
        {books.map((b, index) => (<Text key={index} className='font-bold text-lg my-4'>{b.title}</Text>))}
      </View>
    </SafeAreaView>
  );
}
