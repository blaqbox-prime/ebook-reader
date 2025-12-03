import { Model } from "@nozbe/watermelondb";
import {date, field, relation, text} from '@nozbe/watermelondb/decorators';

export default class Metadata extends Model {
    static table = 'metadata'
    static associations = {
        books: {type: 'belongs_to', key: 'book_uri'}
    }

    @text('book_uri') bookUri
    @text('title') title
    @text('subtitle') subtitle
    @text('author') author
    @text('publisher') publisher
    @text('cover_image') coverImage
    @text('language') language
    @date('published_date') publishedDate
    @text('description') description
    @field('page_count') pageCount
    @text('categories') categories
    @field('average_rating') averageRating




    @relation('books','book_uri') book


}