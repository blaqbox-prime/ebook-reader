import { preferencesStorage } from '@/src/data/mmkv/preferencesStorage';

/**
 * Wipes every MMKV key between tests. The mock from `jest.setup.ts` is a single
 * shared in-memory instance, so without this a write in one test would leak into
 * the next and make order-dependent failures very hard to read.
 */
export const resetMMKV = (): void => {
  preferencesStorage.clearAll();
};

/** Writes a raw value straight into MMKV, for corruption/edge-case setup. */
export const seedMMKV = (
  key: string,
  value: string | number | boolean
): void => {
  preferencesStorage.set(key, value);
};

export const readMMKV = (key: string): string | undefined =>
  preferencesStorage.getString(key);
