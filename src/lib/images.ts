/**
 * Cloudflare R2 + Image Resizing utilities
 *
 * Images are stored in R2 and served via a custom domain with
 * Cloudflare Image Resizing for on-demand optimization.
 *
 * URL format: https://{domain}/cdn-cgi/image/{options}/{path}
 *
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */

// R2 public URL - your R2 custom domain
const R2_BASE_URL = 'https://photos.asgard.photo';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'low' | 'medium-low' | 'medium-high' | 'high';
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'json';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

/**
 * Generate a Cloudflare Image Resizing URL
 *
 * @param imagePath - Path to the image in R2 (e.g., "rnconf2024/photo1.jpg")
 * @param options - Transformation options
 * @returns Full URL with transformation parameters
 *
 * @example
 * getImageUrl('rnconf2024/photo1.jpg', { width: 800, format: 'webp' })
 * // => "https://photos.asgard.photo/cdn-cgi/image/width=800,format=webp,quality=85/rnconf2024/photo1.jpg"
 */
export function getImageUrl(imagePath: string, options: ImageTransformOptions = {}): string {
  const { width, height, quality = 85, format = 'auto', fit = 'cover' } = options;

  const params: string[] = [];

  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  params.push(`format=${format}`);
  params.push(`fit=${fit}`);

  const optionsString = params.join(',');

  return `${R2_BASE_URL}/cdn-cgi/image/${optionsString}/${imagePath}`;
}

/**
 * Generate srcset for responsive images
 *
 * @param imagePath - Path to the image in R2
 * @param widths - Array of widths to generate
 * @param options - Base transformation options
 * @returns srcset string for use in <img> tags
 *
 * @example
 * getSrcSet('rnconf2024/photo1.jpg', [400, 800, 1200])
 * // => "https://...width=400... 400w, https://...width=800... 800w, ..."
 */
export function getSrcSet(
  imagePath: string,
  widths: number[],
  options: Omit<ImageTransformOptions, 'width'> = {}
): string {
  return widths.map((w) => `${getImageUrl(imagePath, { ...options, width: w })} ${w}w`).join(', ');
}

/**
 * Get the raw R2 URL without transformations (for original files)
 */
export function getRawImageUrl(imagePath: string): string {
  return `${R2_BASE_URL}/${imagePath}`;
}

/**
 * Standard image sizes for the photo gallery
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 400, quality: 80 },
  medium: { width: 800, quality: 85 },
  large: { width: 1600, quality: 90 },
  full: { width: 2400, quality: 95 },
} as const;

/**
 * Standard widths for responsive images
 */
export const RESPONSIVE_WIDTHS = {
  grid: [400, 800],
  cover: [400, 800, 1200],
  lightbox: [800, 1600, 2400],
} as const;
