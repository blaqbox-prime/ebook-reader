import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";

export default class Book extends Model {
    static table = 'books'
    static associations = {
        metadata: {type: 'has_one', foreignKey: 'book_uri'}
    }

    @text('uri') uri
    @text('title') title
    @text('author') creator
    @text('cover_image') coverImage
}