import type { CollectionEntry } from 'astro:content';

/**
 * Archive roll numbers, assigned in shooting-date order (oldest = R—001).
 * Numbers are stable as new events are appended; ties break on event id in
 * codepoint order — locale collation varies by build machine.
 */
export function rollMap(events: CollectionEntry<'events'>[]): Map<string, string> {
  const byShootingDate = [...events].sort(
    (a, b) =>
      a.data.date.getTime() - b.data.date.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
  return new Map(
    byShootingDate.map((event, i) => [event.id, `R—${String(i + 1).padStart(3, '0')}`])
  );
}
