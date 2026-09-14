import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Brand color tokens
const CANVAS_BLACK = '#181311';
const CANVAS_WHITE = '#fffbf9';

// Apple Squircle Path (G2 continuous curvature superellipse on 100x100 canvas with 3px margins)
const SQUIRCLE_PATH =
  'M 50 3 C 69.8 3, 81.7 5.3, 88.1 11.9 C 94.7 18.3, 97 30.2, 97 50 C 97 69.8, 94.7 81.7, 88.1 88.1 C 81.7 94.7, 69.8 97, 50 97 C 30.2 97, 18.3 94.7, 11.9 88.1 C 5.3 81.7, 3 69.8, 3 50 C 3 30.2, 5.3 18.3, 11.9 11.9 C 18.3 5.3, 30.2 3, 50 3 Z';

/**
 * Creates a valid Windows ICO file buffer from an array of PNG buffers.
 * @param {Array<{width: number, height: number, buffer: Buffer}>} pngImages
 * @returns {Buffer}
 */
function createIco(pngImages) {
  const count = pngImages.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = count * dirEntrySize;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved, must be 0
  header.writeUInt16LE(1, 2); // 1 = ICO resource
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  for (const img of pngImages) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette count (0 for >=256 colors)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Image data offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngImages.map((img) => img.buffer)]);
}

/**
 * Parses an SVG string to extract viewBox bounds and combined path data.
 * @param {string} svgContent
 */
function parseSvg(svgContent) {
  let minX = 0;
  let minY = 0;
  let width = 0;
  let height = 0;

  const vbMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      [minX, minY, width, height] = parts;
    }
  }

  if (!width || !height) {
    const wMatch = svgContent.match(/\bwidth=["']([\d.]+)["']/);
    const hMatch = svgContent.match(/\bheight=["']([\d.]+)["']/);
    if (wMatch && hMatch) {
      width = parseFloat(wMatch[1]);
      height = parseFloat(hMatch[1]);
    }
  }

  if (!width || !height) {
    throw new Error('Unable to extract dimensions/viewBox from input SVG');
  }

  const pathMatches = [...svgContent.matchAll(/<path[^>]*\bd=["']([^"']+)["']/g)];
  if (pathMatches.length === 0) {
    throw new Error('No <path d="..." /> elements found in input SVG');
  }

  const combinedPathData = pathMatches.map((m) => m[1].trim()).join(' ');

  return { minX, minY, width, height, pathData: combinedPathData };
}

async function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error('Error: Missing input SVG file path argument.');
    console.error('Usage: node scripts/generate-favicons.mjs <input.svg>');
    console.error('Example: npm run generate:favicons -- run.svg');
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found at ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading input vector from: ${inputPath}`);
  const rawSvg = fs.readFileSync(inputPath, 'utf8');
  const { minX, minY, width, height, pathData } = parseSvg(rawSvg);
  console.log(`Extracted geometry: viewBox(${minX}, ${minY}, ${width}, ${height}), path length: ${pathData.length} chars`);

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // --- 1. SQUIRCLE WORDMARK GEOMETRY (80% squircle width in 100x100 canvas) ---
  const SQUIRCLE_BOUNDS = 94;
  const TARGET_WORDMARK_WIDTH = SQUIRCLE_BOUNDS * 0.8; // 75.2
  const squircleScale = TARGET_WORDMARK_WIDTH / width;
  const scaledSquircleHeight = height * squircleScale;
  const squircleOffsetX = (100 - TARGET_WORDMARK_WIDTH) / 2;
  const squircleOffsetY = (100 - scaledSquircleHeight) / 2;
  const squircleTranslateX = squircleOffsetX - minX * squircleScale;
  const squircleTranslateY = squircleOffsetY - minY * squircleScale;

  // --- ASSET 1: public/favicon.svg ---
  const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    .squircle { fill: ${CANVAS_BLACK}; }
    .wordmark { fill: ${CANVAS_WHITE}; }
    @media (prefers-color-scheme: dark) {
      .squircle { fill: ${CANVAS_WHITE}; }
      .wordmark { fill: ${CANVAS_BLACK}; }
    }
  </style>
  <path class="squircle" d="${SQUIRCLE_PATH}" />
  <g transform="translate(${squircleTranslateX.toFixed(4)}, ${squircleTranslateY.toFixed(4)}) scale(${squircleScale.toFixed(6)})">
    <path class="wordmark" d="${pathData}" />
  </g>
</svg>
`;

  const faviconSvgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(faviconSvgPath, faviconSvgContent, 'utf8');
  console.log(`✓ Generated ${faviconSvgPath}`);

  // --- ASSET 2: public/apple-touch-icon.png (180x180 full bleed with 20px padding) ---
  const TOUCH_ICON_SIZE = 180;
  const TOUCH_ICON_PADDING = 20;
  const TOUCH_TARGET_WIDTH = TOUCH_ICON_SIZE - TOUCH_ICON_PADDING * 2; // 140
  const touchScale = TOUCH_TARGET_WIDTH / width;
  const touchScaledHeight = height * touchScale;
  const touchOffsetX = TOUCH_ICON_PADDING;
  const touchOffsetY = (TOUCH_ICON_SIZE - touchScaledHeight) / 2;
  const touchTranslateX = touchOffsetX - minX * touchScale;
  const touchTranslateY = touchOffsetY - minY * touchScale;

  const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOUCH_ICON_SIZE} ${TOUCH_ICON_SIZE}" width="${TOUCH_ICON_SIZE}" height="${TOUCH_ICON_SIZE}">
  <rect width="${TOUCH_ICON_SIZE}" height="${TOUCH_ICON_SIZE}" fill="${CANVAS_BLACK}" />
  <g transform="translate(${touchTranslateX.toFixed(4)}, ${touchTranslateY.toFixed(4)}) scale(${touchScale.toFixed(6)})">
    <path fill="${CANVAS_WHITE}" d="${pathData}" />
  </g>
</svg>`;

  const appleTouchPngPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(Buffer.from(appleTouchSvg), { density: 300 })
    .resize(TOUCH_ICON_SIZE, TOUCH_ICON_SIZE)
    .png()
    .toFile(appleTouchPngPath);
  console.log(`✓ Generated ${appleTouchPngPath} (180x180)`);

  // --- ASSET 3: public/favicon.ico (32x32 and 16x16 bitmaps) ---
  // Render light mode squircle + wordmark for the ICO fallback
  const icoBaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path fill="${CANVAS_BLACK}" d="${SQUIRCLE_PATH}" />
  <g transform="translate(${squircleTranslateX.toFixed(4)}, ${squircleTranslateY.toFixed(4)}) scale(${squircleScale.toFixed(6)})">
    <path fill="${CANVAS_WHITE}" d="${pathData}" />
  </g>
</svg>`;

  const icoSvgBuffer = Buffer.from(icoBaseSvg);
  const png32 = await sharp(icoSvgBuffer, { density: 300 }).resize(32, 32).png().toBuffer();
  const png16 = await sharp(icoSvgBuffer, { density: 300 }).resize(16, 16).png().toBuffer();

  const icoBuffer = createIco([
    { width: 32, height: 32, buffer: png32 },
    { width: 16, height: 16, buffer: png16 },
  ]);

  const faviconIcoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(faviconIcoPath, icoBuffer);
  console.log(`✓ Generated ${faviconIcoPath} (32x32 + 16x16 multi-res ICO)`);

  console.log('\nAll favicon assets generated successfully.');
}

main().catch((err) => {
  console.error('Fatal error generating favicons:', err);
  process.exit(1);
});
