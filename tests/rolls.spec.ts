import { test, expect } from '@playwright/test';
import { rollMap } from '../src/lib/rolls';

/**
 * Roll number assignment tests (node-side, no browser needed)
 * Roll numbers are the public archive's identity — they must be
 * identical on every build machine.
 */

const event = (id: string, date: string) =>
  ({ id, data: { date: new Date(date) } }) as unknown as Parameters<typeof rollMap>[0][number];

test.describe('rollMap', () => {
  test('assigns rolls in shooting-date order, oldest first', () => {
    const rolls = rollMap([event('newer', '2024-06-01'), event('older', '2021-10-22')]);

    expect(rolls.get('older')).toBe('R—001');
    expect(rolls.get('newer')).toBe('R—002');
  });

  test('same-date ties break on id in codepoint order, independent of build locale', () => {
    // Locale collations disagree with codepoint order (en puts 'amsterdam'
    // before 'Berlin'; th ignores '-' entirely), so a locale-sensitive
    // tie-break would let two build machines number the archive differently.
    const rolls = rollMap([
      event('amsterdam-meetup', '2023-05-12'),
      event('Berlin-meetup', '2023-05-12'),
    ]);

    // 'B' (U+0042) < 'a' (U+0061)
    expect(rolls.get('Berlin-meetup')).toBe('R—001');
    expect(rolls.get('amsterdam-meetup')).toBe('R—002');
  });
});
