import { storeBooks } from '@/lib/storageUtils';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { EPUBParser } from "./EPUBParser";

export const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;
export const COVERS_DIR = `${BOOKS_DIR}covers/`;

// filter out duplicate BookFiles by uri
export const filterDuplicateBookFiles = (
  books: BookFile[],
  newBooks: BookFile[]
): BookFile[] => {
  return newBooks.filter(
    (newBook) => !books.some((existingBook) => existingBook.uri === newBook.uri)
  );
};

export async function ensureDirectory(directory: string) {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
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
        await ensureDirectory(BOOKS_DIR);
        await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });
        return createBookFromFile(destinationUri, asset.name, asset);
      })
    );

    return newBooks
  } catch (error) {
    console.error("Error selecting books:", error);
    Alert.alert("Error", "Failed to add books to library.");
  }
};

export const  scanAppDirectoryForBooks = async (showAlert = true):Promise<void> => {
        try {
          const dirInfo = await ensureDirectory(BOOKS_DIR);
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

          storeBooks(scannedBooks)

        } catch (error) {
          console.error('Error scanning app directory:', error);
        } 
      };

export async function saveBase64CoverImage(base64Data: string, bookId: string): Promise<string> {
  const coversDirPath = `${FileSystem.documentDirectory}${COVERS_DIR}/`;
  const fileName = `${bookId}.jpg`;
  const finalFilePath = `${coversDirPath}${fileName}`;

  try {
    await FileSystem.makeDirectoryAsync(coversDirPath, { intermediates: true });
    
    
    await FileSystem.writeAsStringAsync(
      finalFilePath,
      base64Data,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    console.log(`Cover image saved successfully at: ${finalFilePath}`);
    return finalFilePath;

  } catch (error) {
    console.error("Error saving Base64 cover image:", error);
    throw new Error(`Failed to save cover image for book ${bookId}.`);
  }
}