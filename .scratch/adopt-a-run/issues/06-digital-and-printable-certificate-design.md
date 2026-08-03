# Digital & Printable Certificate Design

Status: resolved  
Type: prototype  

## Question

How should the digital web certificate ("Adoption Run Log") and downloadable physical PDF/PNG certificate be visually styled and formatted?

## Resolution & Detailed Specs

### 1. Route & Identity Architecture
- **Route**: `/log` (default/preview) & `/log/:adopter_id` (persistent public view).
- **Title**: **Adoption Run Log**.
- **ID Schema**: `adopter_id` and `cert_id` are identical 

### 2. Digital Web View (`/log/:adopter_id`) Aesthetics & Layout
- **Design Style**: Tech / Editorial Brutalism with strong typographic hierarchy (`Scale VF` display + `OCR A` telemetry + `Runda` body).
- **Hero Headline**: `"Congratulations! You have successfully adopted [animal name]!"` rendered in large, bold Editorial Brutalist typography.
- **Interactive Leaflet Map & Elevation Sync**:
  - Leaflet map displaying the runner's uploaded/synced GPX route polyline.
  - Interactive SVG elevation profile graph rendered directly below the map.
  - **Scrubbing Sync**: Hovering/scrubbing across the elevation profile graph dynamically moves a glowing pulse marker along the map polyline in real-time.
- **HUD Telemetry Badges**:
  - Distance (km/mi), Average Pace (min/km), Moving Time (hrs:mins), Amount Fundraised ($).
- **OCR A Telemetry Overlay**:
  - Route Name, Difficulty Rating, Completion Date, Adopter ID (`:adopter_id`), Beneficiary Charity Name.
  - **Sanity CMS Impact Equivalency Readout**: Dynamic calculation output based on fundraising/commitment (e.g. `IMPACT EQUIVALENCY: 40 MEALS PROVIDED FOR SHELTER DOGS`).

### 3. Action Buttons Architecture (Bottom Right)
1. **`"Share this digital cert"`**: Opens link sharing dialog with 1-click Copy URL and Web Share API.
2. **`"Share my achievement"`**: Opens the **Social Share Card Generator** overlay modal:
   - Client-side Canvas rendering of 1:1 (Square for Strava/Twitter) and 9:16 (Vertical for IG Stories) graphic cards.
   - 1-click "Copy Image to Clipboard" and "Download Image".
3. **`"Claim physical cert"`**: Opens the **Printable Physical Certificate** overlay modal:
   - High-contrast, ink-friendly light Editorial Brutalist layout.
   - Includes a scannable QR Code linking directly to `/log/:adopter_id`.
   - Export options: Download PDF, Download PNG, and Print.
   - *Future Plan Note*: Option to switch to a Framed Race Bib printable theme (safety pins, bib number, timing barcode).

