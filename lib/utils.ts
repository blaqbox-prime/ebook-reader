import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from "react-native";
import { EPUBParser } from "./EPUBParser";

export const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

// filter out duplicate BookFiles by uri
export const filterDuplicateBookFiles = ( books: BookFile[], newBooks: BookFile[]) : BookFile[]  => {
    return newBooks.filter((newBook) => !books.some((existingBook) => existingBook.uri === newBook.uri));
}

export async function ensureBooksDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }
  return dirInfo;
}

export async function getEpubFilesInDirectory(dir: string): Promise<string[]> {
  const contents = await FileSystem.readDirectoryAsync(dir);
  return contents.filter((file) => file.toLowerCase().endsWith('.epub'));
}

export function filterNewBooks(newBooks: BookFile[], existingBooks: BookFile[]): BookFile[] {
  return newBooks.filter((book) => !existingBooks.some((b) => b.uri === book.uri));
}

export async function createBookFromFile(uri: string, name: string, asset?: Partial<DocumentPicker.DocumentPickerAsset>): Promise<BookFile> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  const { coverImage, author, title } = await extractBookMetadata(uri, name);
  return {
    name,
    uri,
    lastModified: asset?.lastModified ||Date.now(),
    size: asset?.size || 0,
    coverImage: coverImage || null,
    author,
    title,
  };
}

export async function extractBookMetadata(fileUri: string, fileName: string) {
  const parser = new EPUBParser(fileUri);
  const epubData = await parser.parse();
  const author = epubData.metadata.creator || 'Unknown Author';
  const title = epubData.metadata.title || fileName;
  const coverImage = await parser.getCoverImage();
  return { coverImage, author, title };
}

export function alertNoBooksDir() {
  Alert.alert('No Books Directory', 'No books have been added to your library yet.');
}

export function alertNoEpubs() {
  Alert.alert('No EPUB Files', 'No EPUB files found in your library.');
}

