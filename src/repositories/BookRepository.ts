import { Database, Q } from "@nozbe/watermelondb";
import { Book } from "@/src/data/watermelondb/models";

class BookRepository {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Returns the collection for the Book model
   */
  private get booksCollection() {
    return this.database.get<Book>("books");
  }

  /**
   * Fetches all books currently saved in the database
   */
  async getAllBooks(): Promise<Book[]> {
    return await this.booksCollection.query().fetch();
  }

  /**
   * Persists new scanned books into WatermelonDB.
   * It checks for duplicates by URI before saving.
   */
  async saveScannedBooks(scannedFiles: BookFile[]): Promise<void> {
    try {
      // 1. Get existing URIs to prevent DB duplicates
      const existingBooks = await this.getAllBooks();
      const existingUris = new Set(existingBooks.map((b) => b.uri));

      // 2. Filter out files already in the database
      const newFiles = scannedFiles.filter((file) => !existingUris.has(file.uri));

      if (newFiles.length === 0) return;

      // 3. Perform a batch creation for performance
      await this.database.write(async () => {
        const creations = newFiles.map((file) =>
          this.booksCollection.prepareCreate((book) => {
            book.title = file.title;
            book.author = file.author;
            book.uri = file.uri;
            book.coverImage = file.coverImage;
          })
        );
        await this.database.batch(...creations);
      });

      console.log(`Successfully saved ${newFiles.length} new books.`);
    } catch (error) {
      console.error("Failed to save books to WatermelonDB:", error);
      throw error;
    }
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
}

export default BookRepository;