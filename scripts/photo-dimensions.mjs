#!/usr/bin/env node
/**
 * Records every photo's pixel dimensions in src/data/photo-dimensions.json.
 *
 * The galleries are justified rows: each photo takes a share of its row in
 * proportion to its aspect ratio, so the layout has to know the ratios before
 * any image has loaded. Nothing is processed at build time; this script asks
 * Cloudflare Image Resizing for each original's size once and commits the
 * answer.
 *
 * Run it after adding or changing an event:
 *
 *   npm run dimensions
 *
 * Photos that are already recorded are skipped, and entries for photos that
 * no event references any more are dropped. A photo without an entry still
 * renders, cropped to 3:2 in the grid.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Keep in step with R2_BASE_URL in src/lib/images.ts
const R2_BASE_URL = 'https://photos.asgard.photo';
const CONCURRENCY = 8;
const ATTEMPTS = 3;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eventsDir = path.join(root, 'src/content/events');
const outFile = path.join(root, 'src/data/photo-dimensions.json');

const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

/** Image paths in one event file: the cover plus every entry under `photos:`. */
function imagePaths(source) {
  const paths = [];
  let inPhotos = false;
  for (const line of source.split('\n')) {
    const cover = line.match(/^cover:\s*(.+)$/);
    if (cover) paths.push(unquote(cover[1]));

    if (/^photos:\s*$/.test(line)) {
      inPhotos = true;
    } else if (inPhotos) {
      const item = line.match(/^\s+-\s+(.+)$/);
      if (item) paths.push(unquote(item[1]));
      else if (/^\S/.test(line)) inPhotos = false;
    }
  }
  return paths;
}

async function measure(imagePath) {
  const url = `${R2_BASE_URL}/cdn-cgi/image/format=json/${imagePath}`;
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { width, height } = await response.json();
      if (!(width > 0 && height > 0)) throw new Error('no dimensions in response');
      return [width, height];
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`${imagePath}: ${lastError.message}`);
}

const files = (await readdir(eventsDir)).filter((name) => /\.(ya?ml|md)$/.test(name));
const wanted = new Set();
for (const name of files) {
  for (const p of imagePaths(await readFile(path.join(eventsDir, name), 'utf8'))) wanted.add(p);
}

let known = {};
try {
  known = JSON.parse(await readFile(outFile, 'utf8'));
} catch {
  // First run: nothing recorded yet
}

const dimensions = {};
for (const p of wanted) if (known[p]) dimensions[p] = known[p];

const missing = [...wanted].filter((p) => !dimensions[p]);
const failures = [];
let next = 0;

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < missing.length) {
      const p = missing[next++];
      try {
        dimensions[p] = await measure(p);
      } catch (error) {
        failures.push(error.message);
      }
    }
  })
);

// One entry per line, sorted, so a new event is a readable diff
const sorted = Object.keys(dimensions).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const body = sorted.map((p) => `  ${JSON.stringify(p)}: [${dimensions[p].join(', ')}]`).join(',\n');
await writeFile(outFile, `{\n${body}\n}\n`);

const dropped = Object.keys(known).filter((p) => !wanted.has(p)).length;
console.log(
  `${sorted.length} of ${wanted.size} photos recorded ` +
    `(${missing.length - failures.length} measured, ${dropped} dropped).`
);
if (failures.length > 0) {
  console.error(`Could not measure ${failures.length}:\n  ${failures.join('\n  ')}`);
  process.exitCode = 1;
}
