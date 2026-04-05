import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

class ReadingSession extends Model {
  static table = 'reading_sessions';
  @field('book_uri') bookUri!: string;
  @date('time_start_at') timeStart!: Date;
  @date('time_end_at') timeEnd!: Date;

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
}

export default ReadingSession;
