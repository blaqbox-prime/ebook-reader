import type { Bookmark } from '@epubjs-react-native/core';
import type ReadingSession from '@/src/Models/ReadingSession';

/**
 * `processReadingSession` only ever reads `pagesRead`, `bookCompleted` and
 * `durationInMinutes` off the session it is handed, so these factories return a
 * structurally-populated stand-in cast to the real model rather than paying for
 * a WatermelonDB write per case. `durationInMinutes` is a getter on the model,
 * so it has to be defined here.
 */
export type SessionOverrides = {
  pagesRead?: number;
  bookCompleted?: boolean;
  durationInMinutes?: number;
};

export const makeSession = (overrides: SessionOverrides = {}): ReadingSession =>
  ({
    pagesRead: 0,
    bookCompleted: false,
    durationInMinutes: 0,
    ...overrides,
  }) as unknown as ReadingSession;

export const makeBookmark = (overrides: Partial<Bookmark> = {}): Bookmark =>
  ({
    id: 'bm-1',
    cfi: 'epubcfi(/6/4!/4/2/1:0)',
    createdAt: Date.now(),
    ...overrides,
  }) as unknown as Bookmark;

/** A timestamp `days` before local midnight today, for streak arithmetic. */
export const daysAgo = (days: number, base: Date = new Date()): Date => {
  const date = new Date(base);
  date.setDate(date.getDate() - days);
  return date;
};

export const atLocalMidnight = (date: Date = new Date()): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
