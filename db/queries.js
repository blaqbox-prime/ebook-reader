import db from './index.native'

export const fetchAllBooks = () => db.get('books')

export const fetchBookById = async (id) => db.get('books').find(id) 

export const newBookRecord = async (book) => {
    return await db.get('books').create(b => book)
}

