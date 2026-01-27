interface BookFile {
  name: string;
  uri: string;
  lastModified: number;
  size?: number;
  author?: string;
  title? : string;
  coverImage?: string | null;
}

interface MetadataInfo {
    title: string;
    subtitle: string;
    author: string;
    coverImage?: string;
    googleBooksId: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string;
    averageRating?: number;
    description?: string;
    language?: string;
}

interface EPUBMetadata {
  title?: string;
  creator?: string;
  publisher?: string;
  language?: string;
  identifier?: string;
  date?: string;
  description?: string;
  rights?: string;
  [key: string]: string | undefined;
}

interface ManifestItem {
  href: string;
  mediaType: string;
}

interface SpineItem {
  id: string;
  href: string;
}

interface Chapter {
  index: number;
  id: string;
  href: string;
  content: string;
}

interface ParsedEPUB {
  metadata: EPUBMetadata;
  spine: SpineItem[];
  manifest: { [id: string]: ManifestItem };
}