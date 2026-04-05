import Book from '@/src/Models/Book';
import { Model } from '@nozbe/watermelondb';
import { date, field, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

class Metadata extends Model {
  static table = 'metadata';
  static associations: Associations = {
    books: { type: 'belongs_to', key: 'book_uri' },
  };

  @field('book_uri') bookUri?: string;
  @field('title') title?: string;
  @field('subtitle') subtitle?: string;
  @field('author') author?: string;
  @field('publisher') publisher?: string;
  @field('language') language?: string;
  @date('published_date') publishedDate?: Date;
  @field('description') description?: string;
  @field('page_count') pageCount?: number;
  @field('categories') categories?: string[];
  @field('cover_image') coverImage?: string;
  @date('created_at') createdAt?: Date;
  @date('updated_at') updatedAt?: Date;

  @relation('books', 'book_uri') book?: Book;
}

export default Metadata;
