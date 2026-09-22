import { Database, Q } from '@nozbe/watermelondb';
import { Book } from '@/src/data/watermelondb/models';
import { BookFile } from '@/src/types/book.types';

class BookRepository {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Returns the collection for the Book model
   */
  get booksCollection() {
    return this.database.get<Book>('books');
  }

  /**
   * Fetches all books currently saved in the database
   */
  async getAllBooks(): Promise<Book[]> {
    return await this.booksCollection.query().fetch();
  }

  /**
   * Batch create book records
   */
  async createBooks(books: BookFile[]): Promise<void> {
    await this.database.write(async () => {
      const creations = books.map(book =>
        this.booksCollection.prepareCreate(b => {
          const now = new Date();
          b.title = book.title;
          b.author = book.author;
          b.uri = book.uri;
          b.coverImage = book.coverImage;
          b.fileSize = book.size;
          b.lastRead = now;
          b.progress = 0;
          b.createdAt = now;
          b.updatedAt = now;
        })
      );
      await this.database.batch(...creations);
    });
  }

  /**
   * Deletes a book record from the database
   */
  async deleteBook(bookId: string): Promise<void> {
    await this.database.write(async () => {
      const book = await this.booksCollection.find(bookId);
      await book.markAsDeleted(); // WatermelonDB best practice for sync
      await book.destroyPermanently();
    });
  }

  async fetchBookByUri(uri: string): Promise<Book[]> {
    return await this.booksCollection.query(Q.where('uri', uri)).fetch();
  }
  async fetchBooksInProgress(): Promise<Book[]> {
    return await this.booksCollection
      .query(Q.where('progress', Q.gt(0)), Q.sortBy('last_read', Q.desc))
      .fetch();
  }

  async fetchFavoriteBooks(): Promise<Book[]> {
    return await this.booksCollection
      .query(Q.where('is_favorite', Q.eq(true)))
      .fetch();
  }

  async fetchBooksByDateAdded(order: Q.SortOrder) {
    return await this.booksCollection
      .query(Q.sortBy('created_at', order))
      .fetch();
  }
}

export default BookRepository;
