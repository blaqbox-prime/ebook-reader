import db from '@/db/index.native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  LIBRARY: "library",
  BOOKS_CACHE: "books_cache",
  LAST_SCAN: "last_scan_time",
};

export const fetchBooks = async ():Promise<any[]> => {
  const books = await db.get('books').query().fetch()
  return books;
};

export const storeBooks = async (books: BookFile[]) => {
  // 1. Prepare the data structure (synchronous map)
  const booksToStore = books.map(b => ({
    ...b,
    coverImage: "" // Ensure coverImage is always defined for the schema
  }));

  // 2. Map the data into an array of synchronous database actions
  const actions = booksToStore.map((book) =>
    // db.get('books').create() returns a synchronous Action object
    db.get('books').create((b: any) => {
      // The callback receives the immutable record builder 'b'
      b.uri = book.uri;
      b.title = book.title;
      b.creator = book.author;
      b.lastModified = book.lastModified;
      b.coverImage = book.coverImage;
    })
  );

 
  await db.write(async () => {
    await db.batch(
      ...actions
    );
  });
  
  // No need to return anything if the goal is just persistence.
  console.log(`Successfully stored ${books.length} books in WatermelonDB.`);
};

export const updateLastScanTime = async (date: number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN, date.toString())
}