import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

class Metadata extends Model {
  static table = 'metadata';

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
  @field('average_rating') averageRating?: number;
  @field('isbn') isbn?: string;
  @date('created_at') createdAt?: Date;
  @date('updated_at') updatedAt?: Date;
}

export default Metadata;
