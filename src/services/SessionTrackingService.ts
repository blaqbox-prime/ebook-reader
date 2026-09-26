import { watermelondb } from '@/src/data';
import { SessionRepository } from '@/src/repositories';
import { ReadingSession } from '@/src/data/watermelondb/models';
import { Database } from '@nozbe/watermelondb';

class SessionTrackingService {
  async stopSession(
    session: ReadingSession | null
  ): Promise<ReadingSession | null> {
    if (!session) return null;
    try {
      await this.sessionRepository.updateSession(session.id, new Date());
      return await this.fetchSessionById(session.id);
    } catch (error) {
      console.error('Error stopping session:', error);
      return null;
    }
  }
  async fetchSessionById(id: string): Promise<ReadingSession | null> {
    return await this.sessionRepository.fetchSessionById(id);
  }
  private database: Database = watermelondb;
  private sessionRepository: SessionRepository = new SessionRepository(
    this.database
  );

  async getAllSessions(): Promise<ReadingSession[]> {
    return await this.sessionRepository.getAllSessions();
  }

  private getDayRange(date: Date) {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);

    const to = new Date(date);
    to.setDate(to.getDate() + 1);
    to.setHours(0, 0, 0, 0);

    return { from, to };
  }

  async getTotalDurationInMinutes(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions.reduce(
      (total, session) => total + session.durationInMinutes,
      0
    );
  }

  async getTotalDurationForDate(date: Date): Promise<number> {
    const { from, to } = this.getDayRange(date);
    const sessions = await this.getSessionsBetween(from, to);
    return sessions.reduce(
      (total, session) => total + session.durationInMinutes,
      0
    );
  }

  async getTotalDurationTodayInMinutes(): Promise<number> {
    return await this.getTotalDurationForDate(new Date());
  }

  async hasReadAtLeastToday(thresholdMinutes: number): Promise<boolean> {
    const total = await this.getTotalDurationTodayInMinutes();
    return total >= thresholdMinutes;
  }

  /**
   * Repairs sessions that were left open because the process was killed before
   * the reader's unmount cleanup ran. Without this, a force-quit silently
   * under-counts reading time, which in turn under-counts the streak and XP.
   *
   * @param closedAt - Timestamp to attribute the orphaned time to
   */
  async recoverUnclosedSessions(closedAt: Date = new Date()): Promise<number> {
    const orphans = await this.sessionRepository.fetchUnclosedSessions();
    for (const session of orphans) {
      try {
        await this.sessionRepository.closeOrphanedSession(session.id, closedAt);
      } catch (error) {
        console.error('Error recovering orphaned session:', error);
      }
    }
    return orphans.length;
  }

  /**
   * Stamps an in-flight session so a later crash has a real end time to fall
   * back to. Call on background, not just on unmount.
   */
  async stampSession(session: ReadingSession | null): Promise<void> {
    if (!session) return;
    try {
      await this.sessionRepository.updateSession(session.id, new Date());
    } catch (error) {
      console.error('Error stamping session:', error);
    }
  }

  async getSessionsByBookUri(bookUri: string): Promise<ReadingSession[]> {
    return await this.sessionRepository.fetchSessionsByBookUri(bookUri);
  }

  async getSessionsBetween(start: Date, end: Date): Promise<ReadingSession[]> {
    return await this.sessionRepository.fetchSessionsBetween(start, end);
  }

  async createSession(
    bookUri: string,
    timeStart: Date,
    timeEnd?: Date
  ): Promise<ReadingSession> {
    return await this.sessionRepository.createSession({
      bookUri,
      timeStart,
      timeEnd,
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepository.deleteSession(sessionId);
  }
}

export default SessionTrackingService;
