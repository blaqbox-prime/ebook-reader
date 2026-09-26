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
   * Fetches a single reading session by id
   */
  async fetchSessionById(id: string): Promise<ReadingSession> {
    return this.sessionsCollection.find(id);
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
        // An open session has no end yet. Leaving this null marks the session
        // as "still running" so a crash can be detected and repaired, rather
        // than silently recording a zero-minute session.
        record.timeEnd = session.timeEnd ?? null;
      });
    });
  }

  /**
   * Finds sessions that were never closed (the process died before the cleanup
   * handler ran) so they can be repaired instead of being lost.
   */
  async fetchUnclosedSessions(): Promise<ReadingSession[]> {
    return await this.sessionsCollection
      .query(Q.where('time_end_at', null))
      .fetch();
  }

  /**
   * Closes an orphaned session at the given time.
   */
  async closeOrphanedSession(id: string, timeEnd: Date): Promise<void> {
    await this.database.write(async () => {
      const session = await this.sessionsCollection.find(id);
      await session.update(record => {
        record.timeEnd = timeEnd;
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
        Q.where('time_start_at', Q.gte(start.getTime())),
        Q.where('time_start_at', Q.lt(end.getTime())),
        Q.sortBy('time_start_at', Q.desc)
      )
      .fetch();
  }

  /**
   * Updates a reading session's end time
   */
  async updateSession(id: string, timeEnd: Date): Promise<void> {
    await this.database.write(async () => {
      const session = await this.sessionsCollection.find(id);
      await session.update(record => {
        record.timeEnd = timeEnd;
      });
    });
  }
}

export default SessionRepository;
