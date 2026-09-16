#!/usr/bin/env node

/**
 * Downloads the latest Hong Kong .osm.pbf extract from Geofabrik
 * and regenerates the static studio basemap dataset.
 *
 * Usage: npm run update:hk-basemap
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PBF_PATH = path.join(ROOT_DIR, 'scratch', 'hong-kong.osm.pbf');
const EXTRACT_SCRIPT = path.join(ROOT_DIR, 'scripts', 'extract-hk-basemap.mjs');

console.log('--- Updating Hong Kong Basemap from Geofabrik ---');

// If cached scratch PBF exists, remove it to force fresh download
if (fs.existsSync(PBF_PATH)) {
  console.log(`Removing old cached PBF at ${PBF_PATH}...`);
  fs.unlinkSync(PBF_PATH);
}

// Run extraction script
console.log('Running extraction script...');
const result = spawnSync('node', [EXTRACT_SCRIPT, PBF_PATH], {
  stdio: 'inherit',
  cwd: ROOT_DIR,
});

if (result.status !== 0) {
  console.error(`Update failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

console.log('--- Successfully updated Hong Kong Basemap dataset! ---');
