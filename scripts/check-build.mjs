#!/usr/bin/env node
/**
 * Fails `npm run build` when the static output contains dev tooling, Sanity editing
 * artefacts, or dead internal links. See scripts/lib/build-guard.mjs.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { checkBuild } from './lib/build-guard.mjs';

const buildDir = path.resolve('dist/client');

if (!existsSync(buildDir)) {
  console.error(`check-build: ${buildDir} not found — run astro build first.`);
  process.exit(1);
}

/** @type {Map<string, string>} */
const htmlFiles = new Map();
for (const entry of readdirSync(buildDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const absolute = path.join(entry.parentPath, entry.name);
  htmlFiles.set(path.relative(buildDir, absolute).split(path.sep).join('/'), readFileSync(absolute, 'utf8'));
}

const violations = checkBuild(htmlFiles, (relPath) => existsSync(path.join(buildDir, relPath)));

if (violations.length > 0) {
  console.error(`check-build: ${violations.length} production-safety violation(s):`);
  for (const { file, rule, message } of violations) {
    console.error(`  ✗ ${file} [${rule}] ${message}`);
  }
  process.exit(1);
}

console.log(`check-build: ${htmlFiles.size} HTML file(s) clean.`);
