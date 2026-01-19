# Asgard Photo

Conference photography portfolio website built with Astro.

## Features

- Responsive photo gallery with lightbox
- Automatic image optimization (WebP, multiple sizes)
- Dark/light mode based on system preference
- Accessibility-first design (WCAG AA compliant)
- SEO optimized (Open Graph, JSON-LD, sitemap)
- Zero JavaScript by default (except lightbox)

## Adding a New Event

1. Export photos from Lightroom to `src/assets/photos/event-name/`
2. Create an event file at `src/content/events/event-name.yaml`:

```yaml
title: React Summit 2024
date: 2024-06-14
location: Amsterdam, Netherlands
description: Photos from React Summit 2024
cover: ../../assets/photos/react-summit-2024/cover.jpg
photos:
  - ../../assets/photos/react-summit-2024/photo-1.jpg
  - ../../assets/photos/react-summit-2024/photo-2.jpg
  # ... more photos
```

3. Commit and push - Cloudflare Pages will auto-deploy.

## Development

```sh
npm install      # Install dependencies
npm run dev      # Start dev server at localhost:4321
npm run build    # Build production site to ./dist/
npm run preview  # Preview production build locally
npm run lint     # Check code style
npm run lint:fix # Fix code style issues
npm run check    # TypeScript type checking
```

## Deployment

The site is configured for Cloudflare Pages:

1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure custom domain: asgard.photo

## Project Structure

```
src/
  assets/photos/     # Photo originals (not in git)
  components/        # Astro components
  content/events/    # Event metadata (YAML)
  layouts/           # Page layouts
  pages/             # Routes
public/
  _headers           # Cloudflare security headers
  robots.txt         # Search engine config
  favicon.svg        # Site favicon
```

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Sharp](https://sharp.pixelplumbing.com) - Image processing
- TypeScript - Type safety
- ESLint + Prettier - Code quality
