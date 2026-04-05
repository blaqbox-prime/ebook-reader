import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import Book from '@/src/Models/Book';
import Metadata from '@/src/Models/Metadata';
import ReadingSession from '@/src/Models/ReadingSession';
import Achievements from '@/src/Models/Achievements';
// import migrations from './migrations'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'page_turner_db',
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error);
  },
});

const watermelondb = new Database({
  adapter,
  modelClasses: [Book, Metadata, ReadingSession, Achievements],
});

export default watermelondb;
