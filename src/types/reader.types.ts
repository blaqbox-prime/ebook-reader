import type { Bookmark, useReader } from '@epubjs-react-native/core';

export type ReaderContext = ReturnType<typeof useReader>;

export type BookmarkWithContext = Bookmark & {
  bookUri: string;
  bookTitle: string;
  createdAt?: number;
};
