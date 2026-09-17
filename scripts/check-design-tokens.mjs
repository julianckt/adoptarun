#!/usr/bin/env node

/**
 * Advisory Design Token Checker for adopt-a-run
 * 
 * Scans CSS stylesheets and Astro <style> blocks for:
 * - Un-tokenized raw colors (hex, rgb, rgba)
 * - Literal pixel dimensions outside media queries & tokens.css
 * - Custom negative letter-spacing
 * 
 * Runs in advisory/warning mode (exit code 0) to maintain developer flexibility.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Formal exemptions aligned in implementation plan & Issue #27
const EXEMPT_FILES = [
  'src/styles/tokens.css',
  'src/components/CharitySection.astro',
  'src/components/RouteCard.astro',
];

const EXEMPT_PREFIXES = [
  'src/components/sanity/',
];

function isExempt(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  if (EXEMPT_FILES.some(f => normalized === f || normalized.endsWith('/' + f))) {
    return true;
  }
  if (EXEMPT_PREFIXES.some(p => normalized.startsWith(p) || normalized.includes('/' + p))) {
    return true;
  }
  return false;
}

function findScannableFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findScannableFiles(fullPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (ext === '.css' || ext === '.astro') {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function extractCssSnippets(content, ext) {
  if (ext === '.css') {
    return [{ css: content, startLine: 1 }];
  }
  // Extract <style> blocks from .astro files
  const snippets = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(content)) !== null) {
    const preceding = content.slice(0, match.index);
    const startLine = preceding.split('\n').length;
    snippets.push({ css: match[1], startLine });
  }
  return snippets;
}

function checkSnippet(css, startLine) {
  const warnings = [];
  const lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = startLine + i;

    // Skip inline comments or ignore directives
    if (line.includes('/* design-token-ignore */') || line.includes('/* design-check-ignore */')) {
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
      continue;
    }

    // Skip @media line definitions (e.g. @media (width <= 768px))
    if (/^\s*@media\b/.test(trimmed)) {
      continue;
    }

    // Check 1: Raw Hex colors (#fff, #123456)
    const hexMatch = line.match(/(?<![\w-])#([0-9a-fA-F]{3,8})\b/);
    if (hexMatch) {
      warnings.push({
        lineNum,
        type: 'raw-hex-color',
        message: `Literal hex color detected: "${hexMatch[0]}". Use a color token from tokens.css.`,
        snippet: trimmed,
      });
    }

    // Check 2: Raw rgb(...) or rgba(...) outside tokens.css
    const rgbMatch = line.match(/\brgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i);
    if (rgbMatch) {
      warnings.push({
        lineNum,
        type: 'raw-rgb-color',
        message: `Literal rgb/rgba color detected: "${rgbMatch[0]}...)". Use a color/overlay token from tokens.css.`,
        snippet: trimmed,
      });
    }

    // Check 3: Custom negative letter-spacing
    const letterSpacingMatch = line.match(/\bletter-spacing\s*:\s*-[0-9.]+(?:px|em|rem)?/i);
    if (letterSpacingMatch) {
      warnings.push({
        lineNum,
        type: 'forbidden-letter-spacing',
        message: `Custom negative letter-spacing detected: "${letterSpacingMatch[0]}". DESIGN.md requires natural tracking.`,
        snippet: trimmed,
      });
    }

    // Check 4: Literal pixel values in dimensions/spacing (excluding 0px, 0, and out-of-scope route card sizing)
    // Avoid checking selectors or safe-area env fallback
    if (line.includes(':') && !line.includes('env(') && !line.includes('url(')) {
      const pxMatches = [...line.matchAll(/(?<![\w-])(\d*\.?\d+)px\b/gi)];
      for (const m of pxMatches) {
        const val = parseFloat(m[1]);
        // 380px is route-card sizing explicitly allow-listed until route-card refactor lands
        if (val !== 0 && val !== 380) {
          warnings.push({
            lineNum,
            type: 'literal-pixel-value',
            message: `Literal pixel value detected: "${m[0]}". Use a spacing, typography, or layout token.`,
            snippet: trimmed,
          });
        }
      }
    }
  }

  return warnings;
}

function run() {
  const allFiles = findScannableFiles(srcDir);
  let totalWarnings = 0;
  const filesWithWarnings = [];

  for (const file of allFiles) {
    const relPath = path.relative(rootDir, file);
    if (isExempt(relPath)) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const ext = path.extname(file);
    const snippets = extractCssSnippets(content, ext);

    const fileWarnings = [];
    for (const { css, startLine } of snippets) {
      const warnings = checkSnippet(css, startLine);
      fileWarnings.push(...warnings);
    }

    if (fileWarnings.length > 0) {
      filesWithWarnings.push({ file: relPath, warnings: fileWarnings });
      totalWarnings += fileWarnings.length;
    }
  }

  if (totalWarnings > 0) {
    console.log(`\n\x1b[33m[check:design] Design Token Advisory: ${totalWarnings} potential literal(s) found across ${filesWithWarnings.length} file(s):\x1b[0m`);
    for (const { file, warnings } of filesWithWarnings) {
      console.log(`\n  \x1b[1m${file}\x1b[0m`);
      for (const w of warnings) {
        console.log(`    \x1b[33mLine ${w.lineNum}\x1b[0m: [${w.type}] ${w.message}`);
        console.log(`      \x1b[90m${w.snippet}\x1b[0m`);
      }
    }
    console.log(`\n\x1b[32m[check:design] Advisory check complete. (Warning-only mode: 0 exit code)\x1b[0m\n`);
  } else {
    console.log(`\x1b[32m[check:design] Design Token Advisory: 0 literals found. Clean!\x1b[0m`);
  }

  // Always exit 0 in advisory/warning mode per user preference
  process.exit(0);
}

run();
