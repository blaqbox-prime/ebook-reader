import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './schema'
// import migrations from './migrations'
import { Post, Comment } from './models'

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, /* Platform.OS === 'ios' */
  
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error)
  }
})


export default watermelondb = new Database({
  adapter,
  modelClasses: [
    Post,
    Comment
  ],
})