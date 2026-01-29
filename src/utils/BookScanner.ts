import { File, Paths, Directory } from 'expo-file-system';
import { Alert } from 'react-native';
import EPUBParser from './EPUBParser';
import * as DocumentPicker from 'expo-document-picker';

class BookScanner {
  public static readonly BOOKS_DIR = new Directory(Paths.document, 'books');
  public static readonly COVERS_DIR = new Directory(Paths.document, 'covers');

  /**
   * Main entry point: Scans the local directory and returns parsed BookFile objects
   */
  async scanAppDirectory(showAlert = true): Promise<BookFile[]> {
    try {
      await this.ensureDirectory(BookScanner.BOOKS_DIR);

      const epubFiles: File[] = await this.getEpubFilesInDirectory(
        BookScanner.BOOKS_DIR
      );

      if (epubFiles.length === 0) {
        if (showAlert) this.alertNoEpubs();
        return [];
      }

      const scannedBooks = await Promise.all(
        epubFiles.map(file => this.createBookFromFile(file))
      );

      return scannedBooks;
    } catch (error) {
      console.error('Error scanning app directory:', error);
      return [];
    }
  }

  /**
   * Creates a structured BookFile object from a file URI
   */
  async createBookFromFile(file: File): Promise<BookFile> {
    const { coverImage, author, title } = await this.extractBookMetadata(
      file.uri,
      file.name
    );
    return {
      name: file.name,
      uri: file.uri,
      lastModified: file.modificationTime ?? 0,
      size: file.size,
      coverImage: coverImage || null,
      author,
      title,
    };
  }

  /**
   * Compares two lists and returns only the books not already present in the existing list
   */
  filterDuplicates(
    existingBooks: BookFile[],
    newBooks: BookFile[]
  ): BookFile[] {
    return newBooks.filter(
      newBook => !existingBooks.some(existing => existing.uri === newBook.uri)
    );
  }

  // --- Private Helper Methods ---

  private async ensureDirectory(directory: Directory): Promise<void> {
    if (!directory.exists) {
      directory.create();
    }
  }

  private async getEpubFilesInDirectory(dir: Directory): Promise<File[]> {
    const contents: (Directory | File)[] = dir.list();
    const files = contents.filter(item => item instanceof File) as File[];
    return files.filter(file => file.name.toLowerCase().endsWith('.epub'));
  }

  private async extractBookMetadata(fileUri: string, fileName: string) {
    const parser = new EPUBParser(fileUri);
    const epubData = await parser.parse();

    return {
      author: epubData.metadata.creator || 'Unknown Author',
      title: epubData.metadata.title || fileName,
      coverImage: await parser.getCoverImage(),
    };
  }

  private alertNoEpubs() {
    Alert.alert('No EPUB Files', 'No EPUB files found in your library.');
  }

  /**
   * Allows user to pick EPUB files from device storage and adds them to the app's book directory
   * Returns the list of newly added BookFile objects
   * */
  async AddBooksFromFileStorage() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: 'application/epub+zip',
      });

      if (result.canceled || !('assets' in result)) return [];

      const newBooks = await Promise.all(
        result.assets.map(async asset => {
          const originFile: File = new File(asset.uri);
          const destinationFile: File = new File(
            BookScanner.BOOKS_DIR,
            asset.name
          );
          this.ensureDirectory(BookScanner.BOOKS_DIR);

          originFile.copy(destinationFile);
          return this.createBookFromFile(destinationFile);
        })
      );

      return newBooks;
    } catch (error) {
      console.error('Error selecting books:', error);
      throw Error('Failed to add books to library.');
    }
  }
}

export default BookScanner;
