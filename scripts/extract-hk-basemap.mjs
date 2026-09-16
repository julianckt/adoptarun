#!/usr/bin/env node

/**
 * Extracts Hong Kong OpenStreetMap basemap geometry (roads, coastlines, waterways)
 * from a Geofabrik .osm.pbf extract and produces an ultra-compact, pre-indexed JSON dataset.
 *
 * Usage:
 *   node scripts/extract-hk-basemap.mjs [path-to-pbf]
 *
 * Default input: scratch/hong-kong.osm.pbf (downloads if missing)
 * Outputs:
 *   - public/data/hk-basemap.json
 *   - static/data/hk-basemap.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import parseOsm from 'osm-pbf-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PBF_URL = 'https://download.geofabrik.de/asia/china/hong-kong-latest.osm.pbf';
const DEFAULT_PBF_PATH = path.join(ROOT_DIR, 'scratch', 'hong-kong.osm.pbf');

// Hong Kong geographic bounds with margin
const HK_BOUNDS = {
  minLat: 22.15,
  maxLat: 22.60,
  minLng: 113.80,
  maxLng: 114.45,
};

// Target highway regex (identical to Overpass query in gpx-parser.ts)
const HIGHWAY_REGEX = /^(motorway|trunk|primary|secondary|tertiary|residential|pedestrian|footway|cycleway|path)$/;
const WATERWAY_REGEX = /^(river|canal|stream)$/;

/**
 * Douglas-Peucker polyline simplification in degrees.
 * ~0.00005 deg is roughly 5 meters on the ground in Hong Kong.
 */
function perpendicularDistance(p, p1, p2) {
  const [lat, lng] = p;
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;

  const dx = lng2 - lng1;
  const dy = lat2 - lat1;

  if (dx === 0 && dy === 0) {
    const dLat = lat - lat1;
    const dLng = lng - lng1;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  const t = ((lng - lng1) * dx + (lat - lat1) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const projLng = lng1 + clampedT * dx;
  const projLat = lat1 + clampedT * dy;

  const dLat = lat - projLat;
  const dLng = lng - projLng;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function simplifyPolyline(points, toleranceDeg = 0.00004) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > toleranceDeg) {
    const left = simplifyPolyline(points.slice(0, maxIndex + 1), toleranceDeg);
    const right = simplifyPolyline(points.slice(maxIndex), toleranceDeg);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[points.length - 1]];
}

function encodeNumber(val) {
  let sgn = val < 0 ? ~(val << 1) : val << 1;
  let encoded = '';
  while (sgn >= 0x20) {
    encoded += String.fromCharCode((0x20 | (sgn & 0x1f)) + 63);
    sgn >>= 5;
  }
  encoded += String.fromCharCode(sgn + 63);
  return encoded;
}

function encodePolyline(coordinates) {
  if (!coordinates || coordinates.length === 0) return '';
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    const latInt = Math.round(lat * 1e5);
    const lngInt = Math.round(lng * 1e5);
    const dLat = latInt - prevLat;
    const dLng = lngInt - prevLng;
    prevLat = latInt;
    prevLng = lngInt;
    encoded += encodeNumber(dLat) + encodeNumber(dLng);
  }
  return encoded;
}

async function streamPbf(filePath, onItems) {
  return new Promise((resolve, reject) => {
    const parser = parseOsm();
    const stream = fs.createReadStream(filePath);
    stream
      .pipe(parser)
      .on('data', onItems)
      .on('end', resolve)
      .on('error', reject);
    stream.on('error', reject);
  });
}

async function main() {
  const pbfPath = process.argv[2] || DEFAULT_PBF_PATH;

  if (!fs.existsSync(pbfPath)) {
    console.log(`PBF file not found at ${pbfPath}. Downloading from ${PBF_URL}...`);
    fs.mkdirSync(path.dirname(pbfPath), { recursive: true });
    const res = await fetch(PBF_URL);
    if (!res.ok) throw new Error(`Failed to download PBF: ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(pbfPath, buffer);
    console.log(`Downloaded PBF (${(buffer.length / 1024 / 1024).toFixed(1)} MB).`);
  }

  console.log(`Processing OSM PBF: ${pbfPath}`);
  const startTime = Date.now();

  // PASS 1: Identify relevant ways and harvest needed Node IDs
  console.log('Pass 1/2: Scanning ways and filtering target highway & water tags...');
  const neededNodeIds = new Set();
  const roadWays = [];
  const waterWays = [];

  await streamPbf(pbfPath, (items) => {
    for (const item of items) {
      if (item.type === 'way') {
        const hw = item.tags?.highway;
        const isRoad = hw && HIGHWAY_REGEX.test(hw);
        const isWater =
          item.tags?.natural === 'coastline' ||
          (item.tags?.waterway && WATERWAY_REGEX.test(item.tags.waterway));

        if ((isRoad || isWater) && Array.isArray(item.refs) && item.refs.length >= 2) {
          const wayRecord = {
            id: item.id,
            refs: item.refs,
          };
          if (isRoad) roadWays.push(wayRecord);
          if (isWater) waterWays.push(wayRecord);

          for (const ref of item.refs) {
            neededNodeIds.add(ref);
          }
        }
      }
    }
  });

  console.log(
    `Pass 1 complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s: ` +
      `${roadWays.length} road ways, ${waterWays.length} water ways, ` +
      `${neededNodeIds.size} unique nodes required.`
  );

  // PASS 2: Collect coordinates for needed Node IDs only
  console.log('Pass 2/2: Resolving node coordinates...');
  const pass2Start = Date.now();
  // Store lat and lon as Float32 or 2 numbers
  const nodeCoords = new Map();

  await streamPbf(pbfPath, (items) => {
    for (const item of items) {
      if (item.type === 'node') {
        if (neededNodeIds.has(item.id)) {
          // Check bounds
          if (
            item.lat >= HK_BOUNDS.minLat &&
            item.lat <= HK_BOUNDS.maxLat &&
            item.lon >= HK_BOUNDS.minLng &&
            item.lon <= HK_BOUNDS.maxLng
          ) {
            nodeCoords.set(item.id, [Number(item.lat.toFixed(5)), Number(item.lon.toFixed(5))]);
          }
        }
      }
    }
  });

  console.log(
    `Pass 2 complete in ${((Date.now() - pass2Start) / 1000).toFixed(1)}s: ` +
      `Resolved ${nodeCoords.size} node coordinates.`
  );

  // Reconstruct & Simplify Ways
  console.log('Reconstructing and simplifying polylines...');
  const buildWays = (waysList) => {
    const compactList = [];
    for (const way of waysList) {
      const coords = [];
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      for (const ref of way.refs) {
        const pt = nodeCoords.get(ref);
        if (pt) {
          coords.push(pt);
          if (pt[0] < minLat) minLat = pt[0];
          if (pt[0] > maxLat) maxLat = pt[0];
          if (pt[1] < minLng) minLng = pt[1];
          if (pt[1] > maxLng) maxLng = pt[1];
        }
      }

      if (coords.length >= 2) {
        const simplified = simplifyPolyline(coords, 0.00004); // ~4-5m tolerance
        if (simplified.length >= 2) {
          compactList.push({
            b: [
              Number(minLat.toFixed(4)),
              Number(minLng.toFixed(4)),
              Number(maxLat.toFixed(4)),
              Number(maxLng.toFixed(4)),
            ],
            p: encodePolyline(simplified),
          });
        }
      }
    }
    return compactList;
  };

  const compactRoads = buildWays(roadWays);
  const compactWater = buildWays(waterWays);

  const dataset = {
    version: 1,
    generatedAt: new Date().toISOString(),
    bbox: [HK_BOUNDS.minLat, HK_BOUNDS.minLng, HK_BOUNDS.maxLat, HK_BOUNDS.maxLng],
    roads: compactRoads,
    water: compactWater,
  };

  const jsonStr = JSON.stringify(dataset);
  console.log(`Generated dataset: ${compactRoads.length} roads, ${compactWater.length} water features.`);
  console.log(`Uncompressed JSON size: ${(jsonStr.length / 1024 / 1024).toFixed(2)} MB.`);

  // Write to public/data and static/data
  const targets = [
    path.join(ROOT_DIR, 'public', 'data', 'hk-basemap.json'),
    path.join(ROOT_DIR, 'static', 'data', 'hk-basemap.json'),
  ];

  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, jsonStr, 'utf-8');
    console.log(`Wrote ${target} (${(fs.statSync(target).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log(`Total pipeline completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

main().catch((err) => {
  console.error('Fatal error in extraction script:', err);
  process.exit(1);
});
