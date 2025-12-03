const booksApiUrl = "https://www.googleapis.com/books/v1/volumes?q="

export const fetchGoogleBookMetadata = async (author: string, title: string) => {
    try {
        const res = await fetch(`${booksApiUrl}${encodeURI(author) || ""}+${encodeURI(title)}`)
        const body = await res.json()

        if (!body.items) {
            return null;
        }

        const book = body.items[0]

        const metadata: MetadataInfo = {
            title: book.volumeInfo.title,
            subtitle: book.volumeInfo.subtitle,
            author: book.volumeInfo.authors[0],
            coverImage: book.volumeInfo.imageLinks.thumbnail,
            googleBooksId: book.id,
            publisher: book.volumeInfo.publisher,
            publishedDate: book.volumeInfo.publishedDate,
            pageCount: book.volumeInfo.pageCount,
            categories: book.volumeInfo.categories,
            averageRating: book.volumeInfo.averageRating,
            description: book.volumeInfo.description,
            language: book.volumeInfo.language,
        }

        console.log(metadata)

        return metadata;
    }catch (e) {
        console.error(e)
        return null
    }
}