import {
  formatSessionTime,
  formatTimestamp,
} from '@/src/utils/formatTimestamp';

const NOW = new Date('2026-03-10T12:00:00');

describe('formatTimestamp', () => {
  it('returns a friendly fallback for a missing or invalid timestamp', () => {
    expect(formatTimestamp(0, NOW)).toBe('Recently added');
    expect(formatTimestamp(Number.NaN, NOW)).toBe('Recently added');
  });

  it('labels the same day as Today', () => {
    const sameDay = new Date('2026-03-10T08:15:00');

    expect(formatTimestamp(sameDay.getTime(), NOW)).toMatch(/^Today at /);
  });

  it('labels the previous day as Yesterday', () => {
    const yesterday = new Date('2026-03-09T08:15:00');

    expect(formatTimestamp(yesterday.getTime(), NOW)).toMatch(/^Yesterday at /);
  });

  it('omits the year within the same calendar year', () => {
    const earlier = new Date('2026-01-05T08:15:00');

    expect(formatTimestamp(earlier.getTime(), NOW)).toMatch(/^Jan 5 at /);
  });

  it('includes the year for a different calendar year', () => {
    const lastYear = new Date('2025-12-24T08:15:00');

    expect(formatTimestamp(lastYear.getTime(), NOW)).toMatch(
      /^Dec 24, 2025 at /
    );
  });
});

describe('formatSessionTime', () => {
  it('returns an em dash for an invalid date', () => {
    expect(formatSessionTime(new Date('nonsense'))).toBe('—');
  });

  it('labels the same day as Today', () => {
    const sameDay = new Date('2026-03-10T08:15:00');

    expect(formatSessionTime(sameDay, NOW)).toMatch(/^Today, /);
  });

  it('labels the previous day as Yesterday', () => {
    const yesterday = new Date('2026-03-09T08:15:00');

    expect(formatSessionTime(yesterday, NOW)).toMatch(/^Yesterday, /);
  });

  it('omits the year within the same calendar year', () => {
    const earlier = new Date('2026-01-05T08:15:00');

    expect(formatSessionTime(earlier, NOW)).toMatch(/^Jan 5, /);
  });

  it('includes the year for a different calendar year', () => {
    const lastYear = new Date('2025-12-24T08:15:00');

    expect(formatSessionTime(lastYear, NOW)).toMatch(/^Dec 24, 2025, /);
  });
});
