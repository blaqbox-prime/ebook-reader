import { Collection, Database, Q } from '@nozbe/watermelondb';
import { ReadingSession } from '@/src/data/watermelondb/models';

class SessionRepository {
  private database: Database;
  private sessionsCollection: Collection<ReadingSession>;

  constructor(database: Database) {
    this.database = database;
    this.sessionsCollection =
      this.database.get<ReadingSession>('reading_sessions');
  }

  /**
   * Fetches all saved reading sessions
   */
  async getAllSessions(): Promise<ReadingSession[]> {
    return await this.sessionsCollection
      .query(Q.sortBy('time_start_at', Q.desc))
      .fetch();
  }

  /**
   * Creates a new reading session record
   */
  async createSession(session: {
    bookUri: string;
    timeStart: Date;
    timeEnd?: Date;
  }): Promise<ReadingSession> {
    return await this.database.write(async () => {
      return this.sessionsCollection.create(record => {
        record.bookUri = session.bookUri;
        record.timeStart = session.timeStart;
        record.timeEnd = session.timeEnd ?? session.timeStart; // Default to timeStart if timeEnd is not provided
      });
    });
  }

  /**
   * Deletes a reading session record
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.database.write(async () => {
      const session = await this.sessionsCollection.find(sessionId);
      await session.markAsDeleted();
      await session.destroyPermanently();
    });
  }

  /**
   * Fetches session records for a specific book URI
   */
  async fetchSessionsByBookUri(bookUri: string): Promise<ReadingSession[]> {
    return await this.sessionsCollection
      .query(Q.where('book_uri', bookUri), Q.sortBy('time_start_at', Q.desc))
      .fetch();
  }

  /**
   * Fetches sessions that started within the specified date range
   */
  async fetchSessionsBetween(
    start: Date,
    end: Date
  ): Promise<ReadingSession[]> {
    return await this.sessionsCollection
      .query(
        Q.where(
          'time_start_at',
          Q.gte(start.toTemporalInstant().epochMilliseconds)
        ),
        Q.where(
          'time_end_at',
          Q.lte(end.toTemporalInstant().epochMilliseconds)
        ),
        Q.sortBy('time_start_at', Q.desc)
      )
      .fetch();
  }

  /*
  Update Sesson End Time
*/
  async updateSession(id: string, arg1: { timeEnd: Date }): Promise<void> {
    await this.database.write(async () => {
      const session = await this.sessionsCollection.find(id);
      session.timeEnd = arg1.timeEnd;
      await session.update(session => {
        session.timeEnd = arg1.timeEnd;
      });
    });
  }
}

export default SessionRepository;
