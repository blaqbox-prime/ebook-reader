export type ReaderArchetype =
  | 'bibliophile'
  | 'night-owl'
  | 'deep-thinker'
  | 'cozy-novelist';

export const READER_ARCHETYPE_KEYS: ReaderArchetype[] = [
  'bibliophile',
  'night-owl',
  'deep-thinker',
  'cozy-novelist',
];

export const isReaderArchetype = (value: unknown): value is ReaderArchetype =>
  typeof value === 'string' &&
  READER_ARCHETYPE_KEYS.includes(value as ReaderArchetype);
