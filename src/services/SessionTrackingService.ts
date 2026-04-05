import { watermelondb } from '@/src/data';
import { SessionRepository } from '@/src/repositories';
import { ReadingSession } from '@/src/data/watermelondb/models';
import { Database } from '@nozbe/watermelondb';

class SessionTrackingService {
  stopSession(session: ReadingSession | null) {
    if (!session) return;
    this.sessionRepository
      .updateSession(session.id, { timeEnd: new Date() })
      .catch(error => {
        console.error('Error stopping session:', error);
      });
  }
  private database: Database = watermelondb;
  private sessionRepository: SessionRepository = new SessionRepository(
    this.database
  );

  async getAllSessions(): Promise<ReadingSession[]> {
    return await this.sessionRepository.getAllSessions();
  }

  async getTotalDurationInMinutes(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions.reduce(
      (total, session) => total + session.durationInMinutes,
      0
    );
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
