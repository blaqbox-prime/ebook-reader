import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import EPUBParser from './EPUBParser';
import * as DocumentPicker from 'expo-document-picker';

export interface BookFile {
  name: string;
  uri: string;
  lastModified: number;
  size: number;
  coverImage: string | null;
  author: string;
  title: string;
}

class BookScanner {
  // Legacy paths are strings
  public static readonly BOOKS_DIR = `${FileSystem.documentDirectory}books/`;
  public static readonly COVERS_DIR = `${FileSystem.documentDirectory}covers/`;

  async scanAppDirectory(showAlert = true): Promise<BookFile[]> {
    try {
      await this.ensureDirectory(BookScanner.BOOKS_DIR);

      // readDirectoryAsync only returns names (strings), not file objects
      const fileNames = await FileSystem.readDirectoryAsync(
        BookScanner.BOOKS_DIR
      );
      const epubFiles = fileNames.filter(name =>
        name.toLowerCase().endsWith('.epub')
      );

      if (epubFiles.length === 0) {
        if (showAlert) this.alertNoEpubs();
        return [];
      }

      const scannedBooks = await Promise.all(
        epubFiles.map(async name => {
          const uri = `${BookScanner.BOOKS_DIR}${name}`;
          const info = await FileSystem.getInfoAsync(uri);

          if (!info.exists) return null;

          return this.createBookFromUri(
            uri,
            name,
            info.size,
            info.modificationTime
          );
        })
      );

      // Filter out any nulls from failed getInfoAsync calls
      return scannedBooks.filter((book): book is BookFile => book !== null);
    } catch (error) {
      console.error('Error scanning app directory:', error);
      return [];
    }
  }

  async createBookFromUri(
    uri: string,
    name: string,
    size: number,
    modTime?: number
  ): Promise<BookFile> {
    const { coverImage, author, title } = await this.extractBookMetadata(
      uri,
      name
    );

    return {
      name,
      uri,
      lastModified: modTime ?? 0,
      size,
      coverImage: coverImage || null,
      author,
      title,
    };
  }

  // --- Private Helper Methods ---

  private async ensureDirectory(dirUri: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }
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

  async AddBooksFromFileStorage(): Promise<BookFile[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: 'application/epub+zip',
      });

      if (result.canceled || !result.assets) return [];

      await this.ensureDirectory(BookScanner.BOOKS_DIR);

      const newBooks = await Promise.all(
        result.assets.map(async asset => {
          const destinationUri = `${BookScanner.BOOKS_DIR}${asset.name}`;

          // Legacy copy command
          await FileSystem.copyAsync({
            from: asset.uri,
            to: destinationUri,
          });

          const info = await FileSystem.getInfoAsync(destinationUri);
          return this.createBookFromUri(
            destinationUri,
            asset.name,
            info.exists ? info.size : 0,
            info.exists ? info.modificationTime : 0
          );
        })
      );

      return newBooks;
    } catch (error) {
      console.error('Error selecting books:', error);
      throw new Error('Failed to add books to library.');
    }
  }
}

export default BookScanner;
