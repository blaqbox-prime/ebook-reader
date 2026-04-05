import { Metadata } from '@/src/data/watermelondb/models';
import { Model, Query } from '@nozbe/watermelondb';
import { field, date, children, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

class Book extends Model {
  static table = 'books';
  static associations: Associations = {
    metadata: { type: 'has_many', foreignKey: 'book_id' },
  };

  @field('uri') uri!: string;
  @field('title') title!: string;
  @field('author') author!: string;
  @field('cover_image') coverImage!: string;
  @field('last_read') lastRead!: Date;
  @field('progress') progress!: number;
  @field('last_location') lastLocation!: string;
  @field('is_favorite') isFavorite!: boolean;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('metadata') metadata!: Query<Metadata>;

  @writer async updateLastRead() {
    await this.update((book: Book) => (book.lastRead = new Date()));
  }

  @writer async updateProgress(value: number) {
    await this.update(book => (book.progress = value));
  }

  @writer async updateLastLocation(value: string) {
    await this.update(book => (book.lastLocation = value));
  }
  @writer async toggleIsFavourite() {
    await this.update((book: Book) => (book.isFavorite = !book.isFavorite));
  }
}

export default Book;
