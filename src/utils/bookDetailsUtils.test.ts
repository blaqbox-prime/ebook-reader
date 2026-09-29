import {
  computeCurrentPage,
  computeTimeLeftMinutes,
  computeTotalMinutes,
  formatDuration,
  formatFileSize,
  formatPublishedDate,
  formatRating,
  formatTimeLeft,
  getCategoryChips,
  getCoverUri,
} from '@/src/utils/bookDetailsUtils';

describe('bookDetailsUtils', () => {
  describe('formatRating', () => {
    it('renders one decimal place', () => {
      expect(formatRating(4.25)).toBe('4.3');
      expect(formatRating(3)).toBe('3.0');
    });

    it('returns null when unavailable', () => {
      expect(formatRating(undefined)).toBeNull();
      expect(formatRating(null)).toBeNull();
      expect(formatRating(NaN)).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('renders megabytes with one decimal place', () => {
      expect(formatFileSize(1024 * 1024 * 2.44)).toBe('2.4 MB');
    });

    it('returns null when unavailable or negative', () => {
      expect(formatFileSize(undefined)).toBeNull();
      expect(formatFileSize(null)).toBeNull();
      expect(formatFileSize(-1)).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it.each([
      [0, '0m'],
      [45, '45m'],
      [60, '1h 0m'],
      [255, '4h 15m'],
    ])('formats %i minutes as %s', (minutes, expected) => {
      expect(formatDuration(minutes)).toBe(expected);
    });

    it('clamps negatives to zero', () => {
      expect(formatDuration(-30)).toBe('0m');
    });
  });

  describe('formatTimeLeft', () => {
    it('appends "left"', () => {
      expect(formatTimeLeft(72)).toBe('~1h 12m left');
      expect(formatTimeLeft(42)).toBe('~42m left');
    });

    it('handles zero explicitly', () => {
      expect(formatTimeLeft(0)).toBe('~0m left');
    });
  });

  describe('computeTotalMinutes', () => {
    it('derives minutes from the page count', () => {
      expect(computeTotalMinutes(120)).toBe(120);
    });

    it('returns null for an unusable page count', () => {
      expect(computeTotalMinutes(undefined)).toBeNull();
      expect(computeTotalMinutes(0)).toBeNull();
      expect(computeTotalMinutes(-5)).toBeNull();
    });
  });

  describe('computeTimeLeftMinutes', () => {
    it('scales the total by the remaining proportion', () => {
      expect(computeTimeLeftMinutes(0, 100)).toBe(100);
      expect(computeTimeLeftMinutes(50, 100)).toBe(50);
      expect(computeTimeLeftMinutes(100, 100)).toBe(0);
    });

    it('clamps progress outside 0-100', () => {
      expect(computeTimeLeftMinutes(-10, 100)).toBe(100);
      expect(computeTimeLeftMinutes(150, 100)).toBe(0);
    });

    it('returns null without a page count', () => {
      expect(computeTimeLeftMinutes(50, undefined)).toBeNull();
    });
  });

  describe('computeCurrentPage', () => {
    it('returns a 1-based page within bounds', () => {
      expect(computeCurrentPage(50, 200)).toBe(100);
      expect(computeCurrentPage(100, 200)).toBe(200);
    });

    it('never returns a page below 1', () => {
      expect(computeCurrentPage(0, 200)).toBeGreaterThanOrEqual(1);
      expect(computeCurrentPage(-10, 200)).toBeGreaterThanOrEqual(1);
    });

    it('never returns a page above the total', () => {
      expect(computeCurrentPage(100, 200)).toBeLessThanOrEqual(200);
      expect(computeCurrentPage(150, 200)).toBeLessThanOrEqual(200);
    });

    it('returns null without a usable page count', () => {
      expect(computeCurrentPage(50, undefined)).toBeNull();
      expect(computeCurrentPage(50, 0)).toBeNull();
    });
  });

  describe('formatPublishedDate', () => {
    it('renders a long-form date', () => {
      expect(formatPublishedDate('2020-08-13')).toBe('August 13, 2020');
    });

    it('accepts a Date', () => {
      expect(formatPublishedDate(new Date('2020-08-13T00:00:00'))).toBe(
        'August 13, 2020'
      );
    });

    it('returns null for unavailable or invalid input', () => {
      expect(formatPublishedDate(undefined)).toBeNull();
      expect(formatPublishedDate(null)).toBeNull();
      expect(formatPublishedDate('not a date')).toBeNull();
    });
  });

  describe('getCoverUri', () => {
    it('prefers the book cover, then the metadata cover', () => {
      expect(getCoverUri('book.png', 'meta.png')).toBe('book.png');
      expect(getCoverUri(null, 'meta.png')).toBe('meta.png');
      expect(getCoverUri(undefined, undefined)).toBeNull();
    });
  });

  describe('getCategoryChips', () => {
    it('caps the number of chips', () => {
      expect(getCategoryChips(['a', 'b', 'c', 'd', 'e'])).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('honours a custom cap', () => {
      expect(getCategoryChips(['a', 'b'], 1)).toEqual(['a']);
    });

    it('tolerates a missing list', () => {
      expect(getCategoryChips(undefined)).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------
  // BUG-18: computeCurrentPage clamps to a minimum of 1, so an unopened book
  // (0% progress) renders as "Page 1 of N" rather than indicating that no page
  // has been read yet.
  // ---------------------------------------------------------------------
  describe('BUG-18: 0% progress renders as Page 1', () => {
    it.todo('returns null (or 0) at 0% progress instead of page 1');
  });
});
