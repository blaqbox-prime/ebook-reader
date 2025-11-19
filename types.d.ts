type BookFile = {
    uri: string,
    name: string,
    size?: number,
    lastModified?: number,
    coverImage?: string | null,
    author?: string,
    title?: string 
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