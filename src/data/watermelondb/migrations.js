import {
  addColumns,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: 'reading_sessions',
          columns: [
            { name: 'pages_read', type: 'number', isOptional: true },
            { name: 'session_notes', type: 'string', isOptional: true },
            { name: 'book_completed', type: 'boolean', isOptional: true },
          ],
        }),
        addColumns({
          table: 'metadata',
          columns: [{ name: 'cover_image', type: 'string', isOptional: true }],
        }),
      ],
    },
  ],
});
