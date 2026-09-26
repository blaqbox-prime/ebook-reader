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
