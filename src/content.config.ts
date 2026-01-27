import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml,yml}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string(),
    description: z.string().optional(),
    // Images are stored in Cloudflare R2 and referenced by path
    // Full URL is constructed using the R2_PUBLIC_URL environment variable
    cover: z.string(),
    photos: z.array(z.string()).min(1).optional(),
    externalUrl: z.string().url().optional(),
  }),
});

export const collections = { events };
