import {
  getLevelFromXp,
  getLevelInfo,
  getLevelTitle,
  xpThresholdForLevel,
} from '@/src/utils/readerLevel';

describe('readerLevel', () => {
  describe('getLevelFromXp', () => {
    it.each([
      [0, 1],
      [99, 1],
      [100, 2],
      [399, 2],
      [400, 3],
      [900, 4],
      [1600, 5],
    ])('maps %i XP to level %i', (xp, expected) => {
      expect(getLevelFromXp(xp)).toBe(expected);
    });

    it('clamps negative XP to level 1', () => {
      expect(getLevelFromXp(-500)).toBe(1);
    });
  });

  describe('xpThresholdForLevel', () => {
    it('requires no XP for level 1', () => {
      expect(xpThresholdForLevel(1)).toBe(0);
    });

    it('is monotonically increasing', () => {
      for (let level = 2; level <= 10; level++) {
        expect(xpThresholdForLevel(level)).toBeGreaterThan(
          xpThresholdForLevel(level - 1)
        );
      }
    });
  });

  describe('getLevelTitle', () => {
    it('returns the known title for each level', () => {
      expect(getLevelTitle(1)).toBe('Novice');
      expect(getLevelTitle(5)).toBe('Scholar');
    });

    it('clamps past the last named level to Legend', () => {
      expect(getLevelTitle(11)).toBe('Legend');
    });
  });

  describe('getLevelInfo', () => {
    it('reports 0% progress and full XP remaining at level 1', () => {
      const info = getLevelInfo(0);

      expect(info.level).toBe(1);
      expect(info.progressPercent).toBe(0);
      expect(info.xpRemaining).toBe(100);
      expect(info.xpTarget).toBe(100);
    });

    it('reports 100% at the exact threshold for the next level', () => {
      const info = getLevelInfo(100);

      expect(info.level).toBe(2);
      expect(info.progressPercent).toBe(0);
      expect(info.xpTarget).toBe(400);
    });

    it('never returns a progress percentage outside 0-100', () => {
      for (const xp of [0, 50, 99, 100, 399, 400, 10_000]) {
        const { progressPercent } = getLevelInfo(xp);
        expect(progressPercent).toBeGreaterThanOrEqual(0);
        expect(progressPercent).toBeLessThanOrEqual(100);
      }
    });

    it('never reports negative XP remaining', () => {
      for (const xp of [0, 100, 100_000, 10_000_000]) {
        expect(getLevelInfo(xp).xpRemaining).toBeGreaterThanOrEqual(0);
      }
    });

    it('reports XP remaining up to the next threshold', () => {
      // 100_000 XP is level 32; level 33 starts at 100 * 32^2 = 102_400.
      const info = getLevelInfo(100_000);

      expect(info.level).toBe(32);
      expect(info.xpTarget).toBe(102_400);
      expect(info.xpRemaining).toBe(2_400);
    });

    it('treats negative XP as level 1 rather than throwing', () => {
      const info = getLevelInfo(-1);

      expect(info.level).toBe(1);
      expect(info.progressPercent).toBe(0);
    });

    it('is monotonic: more XP never lowers the level', () => {
      let previous = 1;
      for (let xp = 0; xp <= 5000; xp += 25) {
        const level = getLevelFromXp(xp);
        expect(level).toBeGreaterThanOrEqual(previous);
        previous = level;
      }
    });
  });
});
