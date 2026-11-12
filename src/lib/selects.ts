/**
 * Selects: the frames that open the home page. Hand-picked for range across
 * events: stage, crowd, crew, photobooth.
 *
 * `event` is the event file's id (its filename without .yaml) and `photo` is
 * the photo's position in that event's `photos` list, counting from 0, so
 * each select links straight to its frame in the event's lightbox.
 *
 * Order matters: the home page wall places tiles by position (first nine on
 * desktop, first six on phones). Positions 1, 3, 4 and 9 are tall tiles and
 * suit portrait frames; the rest are wide and suit landscape ones.
 */
export interface Select {
  event: string;
  photo: number;
  alt: string;
}

export const SELECTS: readonly Select[] = [
  {
    event: 'jsnation-react-summit-2022',
    photo: 72,
    alt: 'A man in sunglasses grinning as he lounges in a pool of pale blue ball-pit balls',
  },
  {
    event: 'react-summit-2023',
    photo: 84,
    alt: 'A speaker at the lectern clenching both fists in celebration',
  },
  {
    event: 'react-native-conf-2024',
    photo: 21,
    alt: 'An attendee caught mid-jump against a pink and green photobooth backdrop',
  },
  {
    event: 'svelte-summit-2022',
    photo: 26,
    alt: 'A speaker singing into a handheld microphone, eyes half closed',
  },
  {
    event: 'cityjs-london-2023',
    photo: 18,
    alt: 'A speaker in profile, mid-sentence, lit softly from the side',
  },
  {
    event: 'jsnation-2023',
    photo: 30,
    alt: 'A long-haired speaker gesturing mid-explanation, clicker in hand',
  },
  {
    event: 'react-summit-2023',
    photo: 105,
    alt: 'A camera operator steadying a rig and looking up towards the stage',
  },
  {
    event: 'jsnation-react-summit-2022',
    photo: 54,
    alt: 'A speaker pointing out at the audience, microphone in the other hand',
  },
  {
    event: 'svelte-summit-2022',
    photo: 76,
    alt: 'A speaker in silhouette holding a microphone against an orange striped screen',
  },
];
