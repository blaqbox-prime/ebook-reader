import { Themes, Theme } from '@epubjs-react-native/core';
import {
  ReaderThemePreference,
  usePreferencesStore,
} from '@/src/store/preferencesStore';

/**
 * Resolves the persisted reader theme preference to an epubjs theme. Only the
 * two palettes the app actually ships are exposed; the preference is stored in
 * MMKV so the choice survives closing the book (it previously reset to
 * `Themes.LIGHT` on every open).
 */
export function getReaderTheme(preference: ReaderThemePreference): Theme {
  return preference === 'dark' ? Themes.DARK : Themes.LIGHT;
}

/** Flips the stored preference and returns the next value. */
export function toggleReaderTheme(
  preference: ReaderThemePreference
): ReaderThemePreference {
  return preference === 'dark' ? 'light' : 'dark';
}

export function getReaderThemeLabel(preference: ReaderThemePreference): string {
  return preference === 'dark' ? 'Night Mode' : 'Light Mode';
}

export { usePreferencesStore };
