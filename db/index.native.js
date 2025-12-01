import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import Book from './models/Book'
import Metadata from './models/Metadata'
import schema from './models/schema'
// import Post from './model/Post' // ⬅️ You'll import your Models here

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'page_turner_db',
  onSetUpError: error => {
    console.error(error)
  }
})

// Then, make a Watermelon database from it!
export default db = new Database({
  adapter,
  modelClasses: [
    Book, Metadata
],
})