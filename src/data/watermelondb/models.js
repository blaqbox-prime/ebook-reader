import { Model } from '@nozbe/watermelondb';
import {
  field,
  children,
  text,
  writer,
  date,
  relation,
} from '@nozbe/watermelondb/decorators';

class Book extends Model {
  static table = 'books';
  static associations = {
    metadata: { type: 'has_one', foreignKey: 'book_uri' },
  };

  @field('uri') uri;
  @field('title') title;
  @field('author') author;
  @field('cover_image') coverImage;
  @field('last_read') lastRead;
  @field('progress') progress;
  @field('last_location') lastLocation;
  @field('is_favorite') isFavorite;

  @writer async updateLastRead() {
    await this.update(book => (book.lastRead = Date.now()));
  }

  @writer async updateProgress(value) {
    await this.update(book => (book.progress = value));
  }

  @writer async updateLastLocation(value) {
    await this.update(book => (book.lastLocation = value));
  }
  @writer async toggleIsFavourite() {
    await this.update(book => (book.isFavorite = !book.isFavorite));
  }
}

class Metadata extends Model {
  static table = 'metadata';
  static associations = {
    books: { type: 'belongs_to', key: 'book_uri' },
  };

  @field('book_uri') bookUri;
  @field('title') title;
  @field('subtitle') subtitle;
  @field('author') author;
  @field('publisher') publisher;
  @field('cover_image') coverImage;
  @field('language') language;
  @date('published_date') publishedDate;
  @field('description') description;
  @field('page_count') pageCount;
  @field('categories') categories;
  @field('average_rating') averageRating;

  @relation('books', 'book_uri') book;
}

class UserStats extends Model {
  static table = 'user_stats';

  @field('total_xp') total_xp;
  @field('current_streak') current_streak;
  @field('longest_streak') longest_streak;
  @field('last_read_at') last_read_at;
}

class ReadSession extends Model {
  static table = 'read_sessions';
  @field('book_id') book_id;
  @field('duration_ms') duration_ms;
  @field('pages_read') pages_read;
  @field('date') date;
}

class Achievements extends Model {
  static table = 'achievements';
  @field('slug') slug;
  @field('title') title;
  @field('unlocked_at') unlocked_at;
  @field('progress_value') progress_value;
}

export { UserStats, ReadSession, Achievements, Book, Metadata };
