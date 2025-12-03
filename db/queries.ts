import db from './index.native'
import Book from './models/Book'
import {Q} from "@nozbe/watermelondb";
import Metadata from "@/db/models/Metadata";

export const fetchAllBooks = async () => await db.get<Book>('books').query().fetch()

export const fetchBookById = async (id: string) => db.get<Book>('books').find(id) 

export const fetchBookByUri = async (uri: string) => db.get<Book>('books').query(Q.where("uri", uri)).fetch()

export const fetchMetadataByUri = async (uri: string) => db.get<Metadata>('metadata').query(Q.where("book_uri", uri)).fetch()

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

export const createNewMetadata = async (bookUri: string, metadata: MetadataInfo) => {
  const newMetadata = await db.write(
    async () => {
      return db.get<Metadata>('metadata').create((m: Metadata) => {
        m.title = metadata.title;
        m.bookUri = bookUri;
        m.subtitle = metadata.subtitle;
        m.subtitle = metadata.subtitle;
        m.author = metadata.author;
        m.publisher = metadata.publisher;
        m.language = metadata.language;
        m.publishedDate = metadata.publishedDate;
        m.description = metadata.description;
        m.pageCount = metadata.pageCount;
        m.categories = metadata.categories;
      });
    }
  );

  if (!newMetadata) {
    return null;
  } else {
    return newMetadata;
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