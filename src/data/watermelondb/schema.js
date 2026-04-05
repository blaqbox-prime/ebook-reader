import { appSchema, tableSchema } from '@nozbe/watermelondb';

const schema = appSchema({
  version: 5,
  tables: [
    tableSchema({
      name: 'books',
      columns: [
        { name: 'uri', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'author', type: 'string' },
        { name: 'cover_image', type: 'string', isOptional: true },
        { name: 'last_read', type: 'number' },
        { name: 'progress', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'last_location', type: 'string', isOptional: true },
        { name: 'is_favorite', type: 'boolean', defaultValue: false },
      ],
    }),
    tableSchema({
      name: 'metadata',
      columns: [
        { name: 'book_uri', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string', isOptional: true },
        { name: 'author', type: 'string' },
        { name: 'publisher', type: 'string', isOptional: true },
        { name: 'language', type: 'string', isOptional: true },
        { name: 'published_date', type: 'number', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'page_count', type: 'number', isOptional: true },
        { name: 'categories', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'read_sessions',
      columns: [
        { name: 'book_uri', type: 'string', isIndexed: true },
        { name: 'time_start_at', type: 'number' },
        { name: 'time_end_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'unlocked_at', type: 'number' },
        { name: 'progress_value', type: 'number' },
      ],
    }),
  ],
});

export default schema;
