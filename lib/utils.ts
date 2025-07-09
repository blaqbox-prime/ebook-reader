// filter out duplicate BookFiles by uri
export const filterDuplicateBookFiles = ( books: BookFile[], newBooks: BookFile[]) : BookFile[]  => {
    return newBooks.filter((newBook) => !books.some((existingBook) => existingBook.uri === newBook.uri));
}

