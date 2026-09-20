export interface EPUBMetadata {
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

export interface ManifestItem {
  href: string;
  mediaType: string;
}

export interface SpineItem {
  id: string;
  href: string;
}

export interface ParsedEPUB {
  metadata: EPUBMetadata;
  spine: SpineItem[];
  manifest: { [id: string]: ManifestItem };
}
