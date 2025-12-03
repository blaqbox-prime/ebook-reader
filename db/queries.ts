import db from './index.native'
import Book from './models/Book'
import {Q} from "@nozbe/watermelondb";

export const fetchAllBooks = async () => await db.get<Book>('books').query().fetch()

export const fetchBookById = async (id: string) => db.get<Book>('books').find(id) 

export const fetchBookByUri = async (uri: string) => db.get<Book>('books').query(Q.where("uri", uri)).fetch()

export const createNewBook = async (bookFile: BookFile) => {
  const newBook = await db.write(
    async () => {
      return db.get<Book>('books').create((b: Book) => {
        b.uri = bookFile.uri;
        b.creator = bookFile.author;
        b.coverImage = bookFile.coverImage;
        b.title = bookFile.title;
      });
    }
  );

  if (!newBook) {
    return null;
  } else {
    return newBook;
  }
}

export const removeAllBooks = async () => {
  await db.write(
    async () => {
      return db.adapter.unsafeExecute({
        sqlString: "DELETE * from books"
      })
    }
  )
}