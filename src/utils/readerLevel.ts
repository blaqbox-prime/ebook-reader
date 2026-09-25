/**
 * Reader leveling system. Uses the same XP-to-level formula as the Home
 * screen (XPSummary) so numbers stay consistent across the app, then maps
 * each level to a reader tier title.
 */

export type LevelInfo = {
  level: number;
  title: string;
  nextTitle: string;
  xpForCurrentLevel: number;
  xpTarget: number;
  xpRemaining: number;
  progressPercent: number;
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Reader',
  3: 'Page-Turner',
  4: 'Bookworm',
  5: 'Scholar',
  6: 'Sage',
  7: 'Luminary',
  8: 'Archivist',
  9: 'Chronicler',
  10: 'Legend',
};

export const getLevelFromXp = (xp: number): number =>
  Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;

/**
 * Cumulative XP required to reach `level`.
 * Level 1 = 0, Level 2 = 100, Level 3 = 400, Level 4 = 900, ...
 */
export const xpThresholdForLevel = (level: number): number =>
  100 * Math.pow(level - 1, 2);

export const getLevelTitle = (level: number): string =>
  LEVEL_TITLES[level] ?? (level >= 10 ? 'Legend' : 'Scholar');

export const getLevelInfo = (xp: number): LevelInfo => {
  const safeXp = Math.max(0, xp);
  const level = getLevelFromXp(safeXp);
  const nextLevel = level + 1;

  const currentFloor = xpThresholdForLevel(level);
  const nextFloor = xpThresholdForLevel(nextLevel);
  const span = Math.max(1, nextFloor - currentFloor);

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((safeXp - currentFloor) / span) * 100))
  );

  return {
    level,
    title: getLevelTitle(level),
    nextTitle: getLevelTitle(nextLevel),
    xpForCurrentLevel: safeXp,
    xpTarget: nextFloor,
    xpRemaining: Math.max(0, nextFloor - safeXp),
    progressPercent,
  };
};
