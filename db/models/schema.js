import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 3,
  tables: [
    tableSchema({
        name: 'books',
        columns: [
            {name: 'uri', type: 'string', isIndexed: true},
            {name: 'title', type: "string"},
            {name: 'author', type: 'string'},
            {name: 'cover_image', type: 'string', isOptional: true},
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
        ]
    }),
    tableSchema({
        name: 'metadata',
        columns: [
            {name: 'book_uri', type: 'string', isIndexed: true},
            {name: 'title', type: 'string'},
            {name: 'creator', type: 'string'},
            {name: 'publisher', type: 'string', isOptional: true},
            {name: 'language', type: 'string', isOptional: true},
            {name: 'date', type: 'string', isOptional: true},
            {name: 'description', type: 'string', isOptional: true},
            {name: 'rights', type: 'string', isOptional: true},
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
        ]
    })
  ]
})