import { storeBooks } from '@/lib/storageUtils';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { EPUBParser } from "./EPUBParser";
import { updateLastScanTime } from "./storageUtils";

export const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

// filter out duplicate BookFiles by uri
export const filterDuplicateBookFiles = (
  books: BookFile[],
  newBooks: BookFile[]
): BookFile[] => {
  return newBooks.filter(
    (newBook) => !books.some((existingBook) => existingBook.uri === newBook.uri)
  );
};

export async function ensureBooksDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }
  return dirInfo;
}

export async function getEpubFilesInDirectory(dir: string): Promise<string[]> {
  const contents = await FileSystem.readDirectoryAsync(dir);
  return contents.filter((file) => file.toLowerCase().endsWith(".epub"));
}

export async function createBookFromFile(
  uri: string,
  name: string,
  asset?: Partial<DocumentPicker.DocumentPickerAsset>
): Promise<BookFile> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  const { coverImage, author, title } = await extractBookMetadata(uri, name);
  return {
    name,
    uri,
    lastModified: asset?.lastModified || Date.now(),
    size: asset?.size || 0,
    coverImage: coverImage || null,
    author,
    title,
  };
}

export async function extractBookMetadata(fileUri: string, fileName: string) {
  const parser = new EPUBParser(fileUri);
  const epubData = await parser.parse();
  const author = epubData.metadata.creator || "Unknown Author";
  const title = epubData.metadata.title || fileName;
  const coverImage = await parser.getCoverImage();
  return { coverImage, author, title };
}

export function alertNoBooksDir() {
  Alert.alert(
    "No Books Directory",
    "No books have been added to your library yet."
  );
}

export function alertNoEpubs() {
  Alert.alert("No EPUB Files", "No EPUB files found in your library.");
}

export const handleSelectBooks = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: "application/epub+zip",
    });

    if (result.canceled || !("assets" in result)) return;

    const newBooks = await Promise.all(
      result.assets.map(async (asset) => {
        const destinationUri = `${BOOKS_DIR}${asset.name}`;
        await ensureBooksDirectory();
        await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });
        return createBookFromFile(destinationUri, asset.name, asset);
      })
    );

    await storeBooks(newBooks);
    console.log("Books Stored");
  } catch (error) {
    console.error("Error selecting books:", error);
    Alert.alert("Error", "Failed to add books to library.");
  }
};

export const  scanAppDirectoryForBooks = async (showAlert = true):Promise<void> => {
        try {
          const dirInfo = await ensureBooksDirectory();
          if (!dirInfo.exists) {
             showAlert && alertNoBooksDir();
          }

          const epubFiles = await getEpubFilesInDirectory(BOOKS_DIR);
          if (epubFiles.length === 0) {
            showAlert && alertNoEpubs()
          };

          const scannedBooks = await Promise.all(
            epubFiles.map((file) => createBookFromFile(`${BOOKS_DIR}${file}`, file))
          );

          updateLastScanTime(Date.now())
          storeBooks(scannedBooks)

        } catch (error) {
          console.error('Error scanning app directory:', error);
        } 
      };