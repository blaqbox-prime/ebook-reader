import { appSchema, tableSchema } from '@nozbe/watermelondb';

const schema = appSchema({
  version: 4,
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
      name: 'user_stats',
      columns: [
        { name: 'total_xp', type: 'number' },
        { name: 'current_streak', type: 'number' },
        { name: 'longest_streak', type: 'number' },
        { name: 'last_read_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'read_sessions',
      columns: [
        { name: 'book_uri', type: 'string', isIndexed: true },
        { name: 'duration_ms', type: 'number' },
        { name: 'pages_read', type: 'number' },
        { name: 'date', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'unlocked_at', type: 'string' },
        { name: 'progress_value', type: 'number' },
      ],
    }),
  ],
});

export default schema;
