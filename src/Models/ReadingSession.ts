import { Model } from '@nozbe/watermelondb';
import { date, field, writer } from '@nozbe/watermelondb/decorators';

class ReadingSession extends Model {
  static table = 'reading_sessions';
  @field('book_uri') bookUri!: string;
  @date('time_start_at') timeStart!: Date;
  @date('time_end_at') timeEnd!: Date;
  @field('pages_read') pagesRead!: number;
  @field('session_notes') sessionNotes?: string;
  @field('book_completed') bookCompleted!: boolean;

  @writer async updatePagesRead(pages: number) {
    await this.update(record => {
      record.pagesRead = pages;
    });
  }

  @writer async updateSessionNotes(notes: string) {
    await this.update(record => {
      record.sessionNotes = notes;
    });
  }

  @writer async updateBookCompleted(completed: boolean) {
    await this.update(record => {
      record.bookCompleted = completed;
    });
  }

  /**
   * Calculates the duration of the reading session in milliseconds
   */
  get duration(): number {
    return this.timeEnd.getTime() - this.timeStart.getTime();
  }

  /**
   * Calculates the duration in minutes
   */
  get durationInMinutes(): number {
    return this.duration / (1000 * 60);
  }

  /**
   * Calculates the duration in hours
   */
  get durationInHours(): number {
    return this.duration / (1000 * 60 * 60);
  }

  @writer async updateEndTime(endTime: Date) {
    await this.update(record => {
      record.timeEnd = endTime;
    });
  }

  @writer async updateStartTime(startTime: Date) {
    await this.update(record => {
      record.timeStart = startTime;
    });
  }
}

export default ReadingSession;
