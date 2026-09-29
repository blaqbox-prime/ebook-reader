import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import logger from '@nozbe/watermelondb/utils/common/logger';

import Book from '@/src/Models/Book';
import Metadata from '@/src/Models/Metadata';
import ReadingSession from '@/src/Models/ReadingSession';
import migrations from '@/src/data/watermelondb/migrations';
import schema from '@/src/data/watermelondb/schema';

// WatermelonDB's default logger emits a banner per adapter event, which floods
// the Jest output and can wedge the reporter's stdout pipe.
logger.silence();

/**
 * Builds a real WatermelonDB instance on the in-memory LokiJS adapter.
 *
 * The production database uses the SQLite adapter, which needs a native module
 * and therefore cannot run under Jest. LokiJS gives us the same schema
 * validation, the same `Q.where` semantics, and the same null/optional column
 * coercion rules, which is exactly what the `time_end_at` regression depends
 * on. `useWebWorker`/`useIncrementalIndexedDB` are off because neither exists
 * in a Jest environment.
 */
export const createTestDatabase = (): Database =>
  new Database({
    adapter: new LokiJSAdapter({
      schema,
      migrations,
      dbName: 'test_db',
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      onSetUpError: error => {
        throw error;
      },
    }),
    modelClasses: [Book, Metadata, ReadingSession],
  });
