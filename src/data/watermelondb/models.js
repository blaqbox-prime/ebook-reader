import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'

class Post extends Model {
  @field('name') name
  @field('body') body
  @children('comments') comments
}

class Comment extends Model {
  @field('body') body
  @field('author') author
}

export { Post, Comment }