import { Database, Q } from '@nozbe/watermelondb';
import { Book } from '@/src/data/watermelondb/models';

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
          b.title = book.title;
          b.author = book.author;
          b.uri = book.uri;
          b.coverImage = book.coverImage;
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
}

export default BookRepository;
