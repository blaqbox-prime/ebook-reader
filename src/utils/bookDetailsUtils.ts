export const MINUTES_PER_PAGE = 1;

/**
 * Formats an average rating (out of 5) with a single decimal place.
 * Returns null when no rating is available.
 */
export const formatRating = (rating?: number): string | null => {
  if (rating === undefined || rating === null || Number.isNaN(rating)) {
    return null;
  }
  return rating.toFixed(1);
};

/**
 * Formats a file size in bytes as a human readable value (e.g. "2.4 MB").
 * Returns null when the size is not available.
 */
export const formatFileSize = (bytes?: number): string | null => {
  if (bytes === undefined || bytes === null || bytes < 0) {
    return null;
  }
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(1)} MB`;
};

/**
 * Formats a duration in minutes as "4h 15m" or "45m".
 */
export const formatDuration = (minutes: number): string => {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

/**
 * Formats an estimated time remaining as "~1h 12m left" or "~42m left".
 */
export const formatTimeLeft = (minutes: number): string => {
  const total = Math.max(0, Math.round(minutes));
  if (total === 0) {
    return '~0m left';
  }
  return `~${formatDuration(total)} left`;
};

/**
 * Estimates the total reading time in minutes from the page count.
 * Returns null when the page count is unavailable.
 */
export const computeTotalMinutes = (pageCount?: number): number | null => {
  if (pageCount === undefined || pageCount === null || pageCount <= 0) {
    return null;
  }
  return pageCount * MINUTES_PER_PAGE;
};

/**
 * Estimates the time remaining in minutes based on reading progress.
 * Returns null when the page count is unavailable.
 */
export const computeTimeLeftMinutes = (
  progress: number,
  pageCount?: number
): number | null => {
  const total = computeTotalMinutes(pageCount);
  if (total === null) {
    return null;
  }
  const progressRatio = Math.min(100, Math.max(0, progress)) / 100;
  return Math.round(total * (1 - progressRatio));
};

/**
 * Returns the current page number for the reading progress.
 * Returns null when the page count is unavailable.
 */
export const computeCurrentPage = (
  progress: number,
  pageCount?: number
): number | null => {
  if (pageCount === undefined || pageCount === null || pageCount <= 0) {
    return null;
  }
  const progressRatio = Math.min(100, Math.max(0, progress)) / 100;
  return Math.max(1, Math.round(progressRatio * pageCount));
};

/**
 * Formats a published date into a long human readable form
 * (e.g. "August 13, 2020"). Returns null when unavailable.
 */
export const formatPublishedDate = (date?: string | Date): string | null => {
  if (date === undefined || date === null) {
    return null;
  }
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Picks the best available cover image URI for a book.
 */
export const getCoverUri = (
  bookCover?: string | null,
  metadataCover?: string
): string | null => bookCover || metadataCover || null;

/**
 * Returns up to `max` category chips for the genre badges.
 */
export const getCategoryChips = (categories?: string[], max = 3): string[] =>
  (categories ?? []).slice(0, max);
