import { Model } from "@nozbe/watermelondb";
import { date, relation, text } from '@nozbe/watermelondb/decorators';

export default class Metadata extends Model {
    static table = 'metadata'
    static associations = {
        books: {type: 'belongs_to', key: 'book_uri'}
    }



    @text('book_uri') bookUri
    @text('title') title
    @text('creator') creator
    @text('publisher') publisher
    @text('language') language
    @date('date') date
    @text('description') description
    @text('rights') rights

    @relation('books','book_uri') book


}