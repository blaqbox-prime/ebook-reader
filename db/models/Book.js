import { Model } from "@nozbe/watermelondb";
import { field, text, writer } from "@nozbe/watermelondb/decorators";

export default class Book extends Model {
    static table = 'books'
    static associations = {
        metadata: {type: 'has_one', foreignKey: 'book_uri'}
    }

    @text('uri') uri
    @text('title') title
    @text('author') creator
    @text('cover_image') coverImage
    @field('last_read') lastRead
    @field('progress') progress
    @field('last_location') lastLocation

    @writer async updateLastRead(){
        await this.update(book => book.lastRead = Date.now())
    }

    @writer async updateProgress(value){
        await this.update(book => book.progress = value)
    }

    @writer async updateLastLocation(value){
        await this.update(book => book.lastLocation = value)
    }


}