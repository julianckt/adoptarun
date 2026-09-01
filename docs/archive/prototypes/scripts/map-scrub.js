/* Leaflet Map & SVG Elevation Scrubber Synchronization Engine */
window.initMapScrubber = function(mapElementId, elevationSvgId, polylinePoints) {
  if (typeof L === 'undefined') return;

  const mapEl = document.getElementById(mapElementId);
  if (!mapEl) return;

  // 1. Initialize Dark Raster Leaflet Map
  const map = L.map(mapElementId, {
    center: polylinePoints[0] || [22.3193, 114.1694],
    zoom: 13,
    zoomControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  // 2. Draw Glowing Volt Polyline
  const polyline = L.polyline(polylinePoints, {
    color: '#ccff00',
    weight: 4,
    opacity: 0.9,
    lineJoin: 'miter'
  }).addTo(map);

  map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

  // 3. Scrub Pulse Marker on Map
  const pulseIcon = L.divIcon({
    className: 'pulse-marker',
    html: '<div style="width:14px;height:14px;background:#ff4500;border:2px solid #fff;border-radius:50%;box-shadow:0 0 12px #ff4500;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  let marker = null;

  // 4. SVG Elevation Scrubber Interactivity
  const svgEl = document.getElementById(elevationSvgId);
  if (!svgEl) return;

  const scrubberLine = document.getElementById('scrubber-line');

  svgEl.addEventListener('mousemove', (e) => {
    const rect = svgEl.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    // Calculate corresponding point along polyline array
    const idx = Math.floor(xPct * (polylinePoints.length - 1));
    const pt = polylinePoints[idx];

    if (pt) {
      if (!marker) {
        marker = L.marker(pt, { icon: pulseIcon }).addTo(map);
      } else {
        marker.setLatLng(pt);
      }
    }

    if (scrubberLine) {
      scrubberLine.style.display = 'block';
      scrubberLine.style.left = `${xPct * 100}%`;
    }
  });

  svgEl.addEventListener('mouseleave', () => {
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    if (scrubberLine) {
      scrubberLine.style.display = 'none';
    }
  });
};
