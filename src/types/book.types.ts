export interface BookFile {
  name: string;
  uri: string;
  lastModified: number;
  size?: number;
  author: string;
  title: string;
  coverImage?: string | null;
}

export interface GoogleBooksMetadata {
  title: string;
  subtitle?: string;
  author: string;
  coverImage?: string;
  googleBooksId: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  description?: string;
  language?: string;
  isbn?: string;
  uri?: string;
}
