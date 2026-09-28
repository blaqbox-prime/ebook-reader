import type { Flow } from '@epubjs-react-native/core';
import { PageLayoutPreference } from '@/src/store/preferencesStore';

/**
 * Maps the persisted page layout to an epubjs rendition flow.
 *
 * `scroll` intentionally keeps `scrolled-doc`, the layout the app shipped with,
 * so upgrading readers see no change in behaviour. `paginated` renders discrete
 * pages, which renders a windowed view instead of the whole book and therefore
 * uses much less memory on large files.
 */
export function getReaderFlow(preference: PageLayoutPreference): Flow {
  return preference === 'paginated' ? 'paginated' : 'scrolled-doc';
}

export function getPageLayoutLabel(preference: PageLayoutPreference): string {
  return preference === 'paginated' ? 'Paginated' : 'Scroll';
}

/** Flips the stored layout and returns the next value. */
export function togglePageLayout(
  preference: PageLayoutPreference
): PageLayoutPreference {
  return preference === 'paginated' ? 'scroll' : 'paginated';
}

/**
 * Formats a 24h clock reminder time as a 12h label, e.g. `8:00 PM`.
 *
 * Done by hand rather than via `toLocaleTimeString` so the output never varies
 * with the device locale: this string is shown in settings and compared by eye,
 * and a user who reads `8:00 PM` in one place should not see `20:00` in the
 * next screen because their phone is set to a 24h region.
 */
export function formatReminderTime(hour: number, minute: number): string {
  const safeHour = Math.min(23, Math.max(0, Math.trunc(hour)));
  const safeMinute = Math.min(59, Math.max(0, Math.trunc(minute)));
  const period = safeHour < 12 ? 'AM' : 'PM';
  // Midnight and noon are the two hours that do not shift, so they are handled
  // explicitly rather than by subtracting 12.
  const displayHour =
    safeHour % 12 === 0 ? 12 : safeHour % 12;
  const displayMinute = String(safeMinute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}
