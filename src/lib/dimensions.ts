import dimensions from '../data/photo-dimensions.json';

/**
 * Pixel dimensions of every photo, recorded by scripts/photo-dimensions.mjs
 * (`npm run dimensions`). The galleries are justified rows, so the layout
 * needs each aspect ratio before the image itself has loaded.
 */
const table = dimensions as Record<string, number[] | undefined>;

/** Assumed for a photo that has not been measured yet: an uncropped 3:2 frame. */
const UNMEASURED = [1500, 1000];

export interface PhotoSize {
  width: number;
  height: number;
  /** width / height, rounded so it is short enough to inline in a style attribute */
  ratio: number;
}

export function getPhotoSize(imagePath: string): PhotoSize {
  const [width, height] = table[imagePath] ?? UNMEASURED;
  return { width, height, ratio: Math.round((width / height) * 10000) / 10000 };
}
