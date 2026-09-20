import { Themes, Theme } from '@epubjs-react-native/core';

const READER_THEMES = Object.values(Themes).slice(0, 2);

export function getCurrentThemeIndex(theme: Theme): number {
  return READER_THEMES.indexOf(theme);
}

export function getNextReaderTheme(theme: Theme): Theme {
  const index = READER_THEMES.indexOf(theme);
  const nextIndex = (index + 1) % READER_THEMES.length;
  return READER_THEMES[nextIndex];
}
