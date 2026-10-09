# asgardphoto

Conference photography archive at asgard.photo. Astro 5 static site. Photos live in Cloudflare R2 behind `photos.asgard.photo` and are resized on the fly by Cloudflare Image Resizing; nothing image-related happens at build time. `dist/` deploys to Cloudflare on push to `main`.

## Commands

- `npm run lint`: `astro check` (types) + ESLint + Prettier check. Must pass before committing.
- `npm run lint:fix`: auto-fix ESLint and Prettier.
- `npm run build`: production build to `dist/`. Run it to confirm pages still render.
- `npm test`: Playwright end-to-end suite; it starts the dev server itself. While iterating, run one file and one project: `npx playwright test tests/lightbox.spec.ts --project=chromium`.
- `npm run pages:deploy`: production deploy. Never run it from a Claude session.

## Layout

- `src/content/events/*.yaml`: one file per event, schema in `src/content.config.ts`. Adding an event is adding a YAML file (see README); image paths are relative to the R2 bucket root.
- `src/lib/images.ts`: R2 + Image Resizing URL and srcset helpers. `src/lib/rolls.ts`: stable archive roll numbers.
- `src/components/PhotoGrid.astro`: masonry grid and the `<dialog>` lightbox. `tests/fixtures.ts` depends on its DOM (`data-index`, the `FR. n / N` counter); change them together.
- `src/layouts/BaseLayout.astro`: shared head, masthead (persisted across view transitions), design tokens.
- `tests/`: Playwright specs (axe-core accessibility, gallery, lightbox, responsive, rolls). Details in `tests/README.md`.

## Rules

- Accessibility is a hard requirement (WCAG 2.1 AA, enforced by `tests/accessibility.spec.ts`): semantic HTML, alt text, keyboard navigation, focus management in the lightbox.
- Client-side JavaScript is limited to Astro's `<ClientRouter />` and the lightbox script in `PhotoGrid.astro`. Don't add client JS, build-time image processing, or new dependencies without a strong reason.
- Tests: role/text locators first, `data-index` for photo buttons, never `waitForTimeout`.
- Prettier formatting (2 spaces, single quotes, 100 cols). Husky + lint-staged run ESLint/Prettier on commit; don't bypass them with `--no-verify`.

## Claude Code cloud sessions

`.claude/hooks/session-start.sh` (cloud sessions only) runs `npm install` and exports `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` so Playwright uses the VM's pre-installed Chromium; browser downloads are blocked there. Firefox isn't available in the VM, so `playwright.config.ts` drops the `firefox` project when `CLAUDE_CODE_REMOTE=true` and `npm test` runs the `chromium` and `Mobile Chrome` projects. `.claude/settings.json` pre-approves the npm, Playwright, Astro and lint commands and blocks deploy commands.
