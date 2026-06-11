# Asgard Photo

Conference photography portfolio website built with Astro and Cloudflare.

## Features

- Responsive photo gallery with native `<dialog>` lightbox
- On-demand image optimization via Cloudflare Image Resizing (WebP/AVIF, multiple sizes)
- "The Archive" design system — dark-only sibling of [asgard.tech](https://asgard.tech), with self-hosted Instrument Serif / Schibsted Grotesk / IBM Plex Mono
- Accessibility-first design (WCAG 2.1 AA compliant)
- SEO optimized (Open Graph, JSON-LD structured data, sitemap)
- Zero JavaScript by default (except lightbox interactivity)
- Keyboard navigation (arrow keys, escape to close)

## Adding a New Event

1. Upload photos to Cloudflare R2 bucket under `event-name/` folder
2. Create an event file at `src/content/events/event-name.yaml`:

```yaml
title: React Summit 2024
date: 2024-06-14
location: Amsterdam, Netherlands
description: Photos from React Summit 2024
cover: event-name/cover.jpg
photos:
  - event-name/photo-1.jpg
  - event-name/photo-2.jpg
```

Image paths are relative to the R2 bucket root (`photos.asgard.photo`).

3. Commit and push - Cloudflare Pages will auto-deploy.

## Development

```sh
npm install       # Install dependencies
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview production build locally
npm run check     # TypeScript type checking
npm run lint      # Check code style
npm run lint:fix  # Fix code style issues
```

## Testing

The project uses Playwright for end-to-end and accessibility testing:

```sh
npm test          # Run all tests (headless)
npm run test:ui   # Run tests with interactive UI
npm run test:headed    # Run tests with visible browser
npm run test:debug     # Debug mode with step-through
npm run test:report    # View HTML test report
```

Tests cover:

- **Accessibility** - WCAG 2.1 AA compliance via axe-core
- **Gallery** - Event cards, photo grid, navigation
- **Lightbox** - Open/close, keyboard navigation, focus management
- **Responsive** - Image optimization, lazy loading, grid layouts

## Deployment

The site is deployed on Cloudflare Pages with images served from Cloudflare R2:

```sh
npm run pages:dev     # Local Cloudflare Pages dev server
npm run pages:deploy  # Build and deploy to Cloudflare Pages
```

**Setup:**

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `dist`
4. Custom domain: `asgard.photo`

**Image CDN:**

- Original photos stored in Cloudflare R2
- Served via custom domain: `photos.asgard.photo`
- On-demand optimization via Cloudflare Image Resizing

## Project Structure

```
src/
  components/        # Astro components (EventCard, PhotoGrid)
  content/events/    # Event metadata (YAML)
  layouts/           # Page layouts
  lib/               # Utilities (Cloudflare image helpers)
  pages/             # Routes
tests/               # Playwright test suite
public/
  _headers           # Cloudflare security headers
  robots.txt         # Search engine config
```

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [Cloudflare Pages](https://pages.cloudflare.com) - Hosting
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Image storage
- [Cloudflare Image Resizing](https://developers.cloudflare.com/images/transform-images/) - On-demand optimization
- [Playwright](https://playwright.dev) - E2E and accessibility testing
- TypeScript, ESLint, Prettier - Code quality
- Husky + lint-staged - Pre-commit hooks
