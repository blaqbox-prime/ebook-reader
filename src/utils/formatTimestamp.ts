const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatTimestamp = (
  timestamp: number,
  now: Date = new Date()
): string => {
  if (!timestamp) return 'Recently added';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Recently added';

  const dayDiff = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / DAY_MS
  );
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;
  if (date.getFullYear() === now.getFullYear()) {
    const day = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${day} at ${time}`;
  }
  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${day} at ${time}`;
};
