import { getCollection, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

/** All events, newest first. Ties break on id so builds are deterministic. */
export async function getSortedEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events');
  return events.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

/** Events grouped by year, newest year first, preserving newest-first order. */
export function groupByYear(events: EventEntry[]): Array<[number, EventEntry[]]> {
  const groups = new Map<number, EventEntry[]>();
  for (const event of events) {
    const year = event.data.date.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), event]);
  }
  return [...groups.entries()];
}

/**
 * A few frames spread evenly through an event, for the index strips.
 * Starts on the cover so the strip opens on the picture the event is known by.
 */
export function sampleFrames(event: EventEntry, count: number): string[] {
  const photos = event.data.photos ?? [];
  const rest = photos.filter((p) => p !== event.data.cover);
  if (rest.length <= count - 1) return [event.data.cover, ...rest];
  const step = rest.length / (count - 1);
  const picks = Array.from({ length: count - 1 }, (_, i) => rest[Math.floor(i * step + step / 2)]);
  return [event.data.cover, ...picks];
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatMonthYear(date: Date): string {
  // Fixed three-letter months: en-GB's short month is "Sept", which breaks the column
  return `${SHORT_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function photoCountLabel(count: number): string {
  return `${count} photo${count === 1 ? '' : 's'}`;
}

/**
 * The YAML descriptions are mostly boilerplate ("Photos from X"), which only
 * repeats the title. Show a description on the page only when it says more.
 */
export function meaningfulDescription(event: EventEntry): string | undefined {
  const description = event.data.description?.trim();
  if (!description || /^photos from [^,]*$/i.test(description)) return undefined;
  return description;
}
