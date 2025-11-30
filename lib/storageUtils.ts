import db from '@/db/index.native';
import Book from '@/db/models/Book';
import { Q } from '@nozbe/watermelondb';

export const STORAGE_KEYS = {
  LIBRARY: "library",
  BOOKS_CACHE: "books_cache",
  LAST_SCAN: "last_scan_time",
};

export const fetchBooks = async ():Promise<any[]> => {
  const books = await db.get('books').query().fetch()
  return books;
};

// export const storeBooks = async (books: BookFile[]) => {
  
//   _.forEach(books, async (book: BookFile) => {
//     const created = await createNewBook(book)
//     if(created){
//       console.log(book.title + " added to db")
//     }
//   })

//   // No need to return anything if the goal is just persistence.
//   console.log(`Successfully stored ${books.length} books in WatermelonDB.`);
// };

export const storeBooks = async (books: BookFile[]) => {
  const booksToStore = books.map(b => ({
    ...b,
    coverImage: b.coverImage || "" // Ensure coverImage is always defined
  }));

  // 1. Prepare all actions (create or update) concurrently
  const preparedActions = await Promise.all(
    booksToStore.map(async (book) => {
      // 2. Query the database to check for an existing book with the same URI
      const existingBooks = await db.get<Book>('books')
        .query(Q.where('uri', book.uri))
        .fetch();

      const existingBook = existingBooks[0];
      const booksCollection = db.get<Book>('books');

      if (existingBook) {
        // 3. If the book exists, prepare an update action
        return existingBook.prepareUpdate((b) => {
          // Update mutable fields only
          b.title = book.title;
          b.creator = book.author;
          b.coverImage = book.coverImage;
        });
      } else {
        // 4. If the book does not exist, prepare a create action
        return booksCollection.prepareCreate((b) => {
          b.uri = book.uri;
          b.title = book.title;
          b.creator = book.author;
          b.coverImage = book.coverImage;
        });
      }
    })
  );

  // 5. Execute the single batch write transaction
  try {
    await db.write(async () => {
      // The spread operator correctly unwraps the array of prepared actions
      await db.batch(...preparedActions);
    });
    console.log(`Successfully upserted ${books.length} books in WatermelonDB.`);
  } catch (error) {
    console.error("Failed to perform batch upsert:", error);
    throw error;
  }
};