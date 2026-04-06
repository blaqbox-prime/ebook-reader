import { watermelondb } from '@/src/data';
import { SessionRepository } from '@/src/repositories';
import { ReadingSession } from '@/src/data/watermelondb/models';
import { Database } from '@nozbe/watermelondb';

class SessionTrackingService {
  async stopSession(session: ReadingSession | null) {
    if (!session) return;
    this.sessionRepository
      .updateSession(session.id, new Date())
      .catch(error => {
        console.error('Error stopping session:', error);
      });

    return await this.fetchSessionById(session.id);
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

  async hasReadAtLeastToday(thresholdMinutes = 5): Promise<boolean> {
    const total = await this.getTotalDurationTodayInMinutes();
    return total >= thresholdMinutes;
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
