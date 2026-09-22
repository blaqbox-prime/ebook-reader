import { GoogleBooksMetadata } from '@/src/types/book.types';

const booksApiUrl = 'https://www.googleapis.com/books/v1/volumes?q=';

export const fetchGoogleBookMetadata = async (
  author: string,
  title: string,
  uri: string
) => {
  try {
    const res = await fetch(
      `${booksApiUrl}${encodeURI(author) || ''}+${encodeURI(` ${title}`)}`
    );
    const body = await res.json();

    if (!body.items) {
      return null;
    }

    const book = body.items[0];
    const volumeInfo = book?.volumeInfo ?? {};
    const imageLinks = volumeInfo.imageLinks ?? {};
    const authors = volumeInfo.authors ?? [];
    const categories = volumeInfo.categories ?? [];
    const industryIdentifiers = volumeInfo.industryIdentifiers ?? [];

    const isbn =
      industryIdentifiers.find(
        (identifier: { type: string; identifier: string }) =>
          identifier.type === 'ISBN_13'
      )?.identifier ??
      industryIdentifiers[0]?.identifier ??
      undefined;

    const thumbnail = imageLinks.thumbnail;

    const metadata: GoogleBooksMetadata = {
      title: volumeInfo.title,
      subtitle: volumeInfo.subtitle,
      author: authors[0],
      coverImage: thumbnail
        ? thumbnail.replace('http://', 'https://')
        : undefined,
      googleBooksId: book.id,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: categories.length > 0 ? categories : undefined,
      averageRating: volumeInfo.averageRating,
      description: volumeInfo.description,
      language: volumeInfo.language,
      isbn,
      uri,
    };

    return metadata;
  } catch (e) {
    console.error(e);
    return null;
  }
};
