/**
 * Builds the confirmation email's hero image from the site's social card.
 *
 * Email clients cannot load Degular, render inline SVG, or paint CSS gradients
 * reliably, so the brand gradient and the "adopt a run" wordmark ship as one
 * image. Source: `public/images/og-default.jpg` (1200x630). Output:
 * `public/email/hero.jpg` (1200x520, displayed at 600px wide for 2x density).
 * Re-run any time; it overwrites.
 *
 * Usage: node scripts/build-email-assets.mjs
 */
import { statSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/images/og-default.jpg';
const OUT = 'public/email/hero.jpg';
const HEIGHT = 520;

await sharp(SRC)
  // Keep the bottom of the card: the wordmark sits in the lower-left.
  .extract({ left: 0, top: 630 - HEIGHT, width: 1200, height: HEIGHT })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT);

console.log(`wrote ${OUT} (${Math.round(statSync(OUT).size / 1024)} KB)`);
