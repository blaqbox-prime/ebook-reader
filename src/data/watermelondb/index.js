import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
// import migrations from './migrations'
 
import { Book, Metadata, UserStats, ReadSession, Achievements } from './models';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'page_turner_db',
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error);
  },
});

const watermelondb = new Database({
  adapter,
  modelClasses: [Book, Metadata, UserStats, ReadSession, Achievements],
});

export default watermelondb;
