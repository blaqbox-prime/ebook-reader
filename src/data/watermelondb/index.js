import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import Book from '@/src/Models/Book';
import Metadata from '@/src/Models/Metadata';
import ReadingSession from '@/src/Models/ReadingSession';
import Achievements from '@/src/Models/Achievements';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
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
