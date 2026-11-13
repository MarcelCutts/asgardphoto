/**
 * Selects: the frames that open the home page. Picked from the whole archive
 * for strength first, then range: stage, crowd, crew, hallway and portraits,
 * spread across events.
 *
 * `event` is the event file's id (its filename without .yaml) and `photo` is
 * the photo's position in that event's `photos` list, counting from 0, so
 * each select links straight to its frame in the event's lightbox.
 *
 * Order matters: the home page wall places tiles by position (first nine on
 * desktop, first six on phones). On desktop, positions 1, 3, 4 and 9 are tall
 * tiles and suit portrait frames; the rest are wide. On phones, 1, 3, 4 and 6
 * are tall and 2 and 5 are wide, so position 6 wants a roughly square frame.
 * The select marked `share` is the share image (cropped to 1200x630).
 */
export interface Select {
  event: string;
  photo: number;
  alt: string;
  /** Optional CSS object-position for the tile crop, e.g. 'center 25%' to keep faces near the top in view. */
  focus?: string;
  /** Use this frame as the home page's share image (cropped to 1200x630); pick a landscape one. */
  share?: boolean;
}

export const SELECTS: readonly Select[] = [
  {
    event: 'react-native-conf-2024',
    photo: 21,
    alt: 'An attendee caught mid-jump against a pink and green photobooth backdrop',
  },
  {
    event: 'jsnation-react-summit-2022',
    photo: 47,
    alt: 'A woman in profile, lit by a single spotlight beam cutting through green haze',
    share: true,
  },
  {
    event: 'svelte-summit-2022',
    photo: 76,
    alt: 'A speaker in silhouette holding a microphone against an orange striped screen',
  },
  {
    event: 'guild-trpc-vs-graphql-2022',
    photo: 6,
    alt: 'A camera operator in headphones watching the stage from behind a tripod rig, above a seated audience',
  },
  {
    event: 'react-summit-2023',
    photo: 100,
    alt: 'Audience members leaning in and smiling during a talk, one of them clapping',
    focus: 'center 20%',
  },
  {
    event: 'cityjs-berlin-2023',
    photo: 5,
    alt: 'Two attendees with their arms round each other, both grinning, warm lights behind them',
    focus: 'center 25%',
  },
  {
    event: 'svelte-summit-2022',
    photo: 95,
    alt: 'Confetti bursting over the audience while a speaker stands at the lectern',
  },
  {
    event: 'react-native-conf-2024',
    photo: 41,
    alt: 'A woman with a short bob smiling softly in magenta and blue light',
  },
  {
    event: 'jsnation-2023',
    photo: 13,
    alt: 'An attendee in headphones working on a laptop in a hanging wicker chair',
  },
];
