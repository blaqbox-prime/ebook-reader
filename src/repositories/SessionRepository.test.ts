import type { Database } from '@nozbe/watermelondb';

import SessionRepository from '@/src/repositories/SessionRepository';
import { createTestDatabase } from '@/src/test/database';

const MINUTE = 60 * 1000;

describe('SessionRepository', () => {
  let db: Database;
  let repo: SessionRepository;

  beforeEach(() => {
    db = createTestDatabase();
    repo = new SessionRepository(db);
  });

  afterEach(async () => {
    await db.write(async () => {
      await db.unsafeResetDatabase();
    });
  });

  describe('createSession', () => {
    it('stores a closed session with both timestamps', async () => {
      const start = new Date('2026-03-01T10:00:00.000Z');
      const end = new Date('2026-03-01T10:30:00.000Z');

      const session = await repo.createSession({
        bookUri: 'book.epub',
        timeStart: start,
        timeEnd: end,
      });

      expect(session.bookUri).toBe('book.epub');
      expect(session.timeStart.getTime()).toBe(start.getTime());
      expect(session.timeEnd.getTime()).toBe(end.getTime());
      expect(session.durationInMinutes).toBeCloseTo(30, 5);
    });
  });

  describe('durationInMinutes', () => {
    it('is positive for a correctly closed session', async () => {
      const start = new Date('2026-03-01T10:00:00.000Z');
      const session = await repo.createSession({
        bookUri: 'a.epub',
        timeStart: start,
        timeEnd: new Date(start.getTime() + 20 * MINUTE),
      });

      expect(session.durationInMinutes).toBeCloseTo(20, 5);
    });

    it('stays positive after a session is closed by recovery', async () => {
      const start = new Date('2026-03-01T10:00:00.000Z');
      const session = await repo.createSession({
        bookUri: 'a.epub',
        timeStart: start,
      });
      const end = new Date(start.getTime() + 7 * MINUTE);
      await repo.closeOrphanedSession(session.id, end);

      const recovered = await repo.fetchSessionById(session.id);

      expect(recovered.durationInMinutes).toBeGreaterThanOrEqual(0);
      expect(recovered.durationInMinutes).toBeCloseTo(7, 5);
    });
  });

  describe('closeOrphanedSession', () => {
    it('stamps an end time onto an existing session', async () => {
      const start = new Date('2026-03-01T10:00:00.000Z');
      const session = await repo.createSession({
        bookUri: 'a.epub',
        timeStart: start,
      });
      const end = new Date(start.getTime() + 12 * MINUTE);

      await repo.closeOrphanedSession(session.id, end);

      const reloaded = await repo.fetchSessionById(session.id);
      expect(reloaded.timeEnd.getTime()).toBe(end.getTime());
    });
  });

  describe('getAllSessions', () => {
    it('returns newest first', async () => {
      const base = new Date('2026-03-01T10:00:00.000Z');
      await repo.createSession({
        bookUri: 'a.epub',
        timeStart: new Date(base.getTime()),
      });
      await repo.createSession({
        bookUri: 'b.epub',
        timeStart: new Date(base.getTime() + 60 * MINUTE),
      });
      await repo.createSession({
        bookUri: 'c.epub',
        timeStart: new Date(base.getTime() + 120 * MINUTE),
      });

      const sessions = await repo.getAllSessions();

      expect(sessions.map(s => s.bookUri)).toEqual([
        'c.epub',
        'b.epub',
        'a.epub',
      ]);
    });
  });

  describe('fetchSessionsByBookUri', () => {
    it('scopes results to one book', async () => {
      const base = new Date('2026-03-01T10:00:00.000Z');
      await repo.createSession({ bookUri: 'a.epub', timeStart: base });
      await repo.createSession({
        bookUri: 'b.epub',
        timeStart: new Date(base.getTime() + 1000),
      });

      const sessions = await repo.fetchSessionsByBookUri('a.epub');

      expect(sessions).toHaveLength(1);
      expect(sessions[0].bookUri).toBe('a.epub');
    });

    it('returns an empty list for a book with no sessions', async () => {
      expect(await repo.fetchSessionsByBookUri('missing.epub')).toEqual([]);
    });
  });

  describe('fetchSessionsBetween', () => {
    it('uses a half-open range', async () => {
      const base = new Date('2026-03-01T10:00:00.000Z');
      await repo.createSession({ bookUri: 'a.epub', timeStart: base });
      await repo.createSession({
        bookUri: 'b.epub',
        timeStart: new Date(base.getTime() + MINUTE),
      });
      await repo.createSession({
        bookUri: 'c.epub',
        timeStart: new Date(base.getTime() + 2 * MINUTE),
      });

      const sessions = await repo.fetchSessionsBetween(
        base,
        new Date(base.getTime() + 2 * MINUTE)
      );

      expect(sessions.map(s => s.bookUri).sort()).toEqual(['a.epub', 'b.epub']);
    });
  });

  describe('deleteSession', () => {
    it('removes the record', async () => {
      const session = await repo.createSession({
        bookUri: 'a.epub',
        timeStart: new Date(),
      });

      await repo.deleteSession(session.id);

      expect(await repo.getAllSessions()).toHaveLength(0);
    });
  });

  describe('updateSession', () => {
    it('moves the end time forward', async () => {
      const start = new Date('2026-03-01T10:00:00.000Z');
      const session = await repo.createSession({
        bookUri: 'a.epub',
        timeStart: start,
      });
      const end = new Date(start.getTime() + 45 * MINUTE);

      await repo.updateSession(session.id, end);

      const reloaded = await repo.fetchSessionById(session.id);
      expect(reloaded.durationInMinutes).toBeCloseTo(45, 5);
    });
  });

  // ---------------------------------------------------------------------
  // BUG-01: `time_end_at` is declared as a non-optional number in
  // src/data/watermelondb/schema.js, but SessionRepository writes `null` for
  // an open session. WatermelonDB coerces that null to 0, which means:
  //   1. `Q.where('time_end_at', null)` never matches, so crash recovery in
  //      SessionTrackingService.recoverUnclosedSessions is dead code and every
  //      force-quit silently loses reading time;
  //   2. the orphan row's duration becomes (0 - timeStart), a large negative
  //      number, which poisons total reading time, the daily streak and XP
  //      permanently.
  // These stay `todo` until the schema is fixed, which requires schema v10
  // with `isOptional: true` plus a matching migration.
  // ---------------------------------------------------------------------
  describe('BUG-01: open sessions are unrecoverable and yield negative durations', () => {
    it.todo('createSession() persists null time_end_at for an open session');

    it.todo(
      'fetchUnclosedSessions() returns every session with a null time_end_at'
    );

    it.todo('durationInMinutes of an unclosed session is not negative');

    it.todo(
      'getTotalDurationInMinutes() is not driven negative by an orphan row'
    );
  });
});
