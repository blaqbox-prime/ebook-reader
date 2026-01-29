import { fetchGoogleBookMetadata } from '@/src/api';
import { watermelondb } from '@/src/data';
import { Book } from '@/src/data/watermelondb/models';
import { BookRepository, MetadataRepository } from '@/src/repositories';
import { Database } from '@nozbe/watermelondb';

class BookService {
  private database: Database = watermelondb;
  private bookRepository: BookRepository = new BookRepository(this.database);
  private metadataRepository: MetadataRepository = new MetadataRepository(
    this.database
  );

  /**
   * Persists new scanned books into WatermelonDB.
   * It checks for duplicates by URI before saving.
   */
  async saveScannedBooksWithMetadata(scannedFiles: BookFile[]): Promise<void> {
    try {
      // 1. Get existing URIs to prevent DB duplicates
      const existingBooks = await this.bookRepository.getAllBooks();
      const existingUris = new Set(existingBooks.map(b => b.uri));

      // 2. Filter out files already in the database
      const newFiles = scannedFiles.filter(file => !existingUris.has(file.uri));

      if (newFiles.length === 0) return;

      // get metadata from google books
      const newFilesMetadata: (GoogleBooksMetadata | null)[] =
        await Promise.all(
          newFiles.map(async file =>
            fetchGoogleBookMetadata(file.author, file.title, file.uri)
          )
        );

      // 3. Perform a batch creation for performance
      await this.bookRepository.createBooks(newFiles);
      await this.metadataRepository.createMetadataBatch(
        newFilesMetadata.filter(
          (metadata): metadata is GoogleBooksMetadata => metadata !== null
        )
      );

      console.log(`Successfully saved ${newFiles.length} new books.`);
    } catch (error) {
      console.error('Failed to save books to WatermelonDB:', error);
      throw error;
    }
  }

  async getBookByUri(uri: string): Promise<Book> {
    const book = await this.bookRepository.fetchBookByUri(uri);
    return book[0];
  }

  async deleteBook(bookId: string): Promise<void> {
    await this.bookRepository.deleteBook(bookId);
    await this.metadataRepository.deleteMetadataByUri(bookId);
  }
}

export default BookService;
