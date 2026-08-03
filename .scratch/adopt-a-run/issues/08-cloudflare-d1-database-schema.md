# Cloudflare D1 Database Schema

Status: resolved  
Type: task  

## Question

What SQL tables and column definitions do we need in Cloudflare D1 for storing runner signups and generated certificate records?

## Resolution & Detailed Specs

### 1. Architecture Overview
- **D1 Database**: Edge SQLite database managed via Cloudflare D1 and Wrangler migrations.
- **Terminology**: Certificate records are stored as **Adoption Run Logs** in the `run_logs` table (accessible at `/log/:adopter_id`).
- **Unified Identifier**: `cert_id` is eliminated in favor of a single unified identifier `adopter_id` (formatted `NNNN-CC`, starting at seed `120`).
- **Sequence Generator**: Eliminates helper sequence tables by using SQLite `seq_num INTEGER PRIMARY KEY AUTOINCREMENT` starting from `120` in `adoptions`, formatting `adopter_id` deterministically in code.
- **Walk-Ins**: Walk-in runners who log a run without prior adoption sign-up get a fresh `adopter_id` generated on the fly and an auto-created `adoptions` record with `status = 'walk_in'`.
- **Multiple Runs**: Subsequent runs logged under the same `adopter_id` append sequential suffixes (`'0124-JC-2'`, `'0124-JC-3'`).

---

### 2. SQL Schema Definitions

```sql
-- 1. ADOPTIONS TABLE (Runner adoption portal commitments)
CREATE TABLE adoptions (
  seq_num INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-increments (starts from 120)
  adopter_id TEXT UNIQUE NOT NULL,             -- Formatted 'NNNN-CC' (e.g. '0124-JC')
  runner_first_name TEXT NOT NULL,
  runner_last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  route_slug TEXT NOT NULL,                   -- Sanity CMS route identifier
  charity_slug TEXT NOT NULL,                 -- Sanity CMS charity identifier
  commitment_days INTEGER NOT NULL DEFAULT 5, -- Days committed (1 to 20)
  target_date TEXT NOT NULL,                  -- ISO calculated completion date (YYYY-MM-DD)
  target_hkd INTEGER NOT NULL DEFAULT 500,    -- Target fundraising amount in HKD
  animal_name TEXT NOT NULL,                  -- Custom animal name chosen by runner
  status TEXT NOT NULL DEFAULT 'committed',   -- 'committed', 'completed', 'walk_in', 'expired'
  confirmation_email_sent_at TEXT,           -- ISO timestamp when Resend email sent
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. RUN_LOGS TABLE (Verified completed run telemetry for /log/:adopter_id)
CREATE TABLE run_logs (
  adopter_id TEXT PRIMARY KEY,                -- '0124-JC' (or '0124-JC-2' for multi-runs)
  adoption_ref_id TEXT NOT NULL,              -- FK linking back to adoptions.adopter_id
  runner_name TEXT NOT NULL,                  -- Display name on certificate
  route_slug TEXT NOT NULL,                   -- Sanity CMS route identifier
  distance_km REAL NOT NULL,                  -- Total distance in km (e.g. 10.45)
  moving_time_seconds INTEGER NOT NULL,      -- Moving time in seconds
  elevation_gain_m INTEGER NOT NULL,          -- Total elevation gain in meters
  avg_pace_min_per_km REAL NOT NULL,          -- Pace in min/km (e.g. 5.15)
  fundraised_hkd INTEGER NOT NULL DEFAULT 0,  -- Fundraised amount for impact equivalency
  polyline_json TEXT NOT NULL,                -- Leaflet map route path string / GeoJSON
  elevation_profile_json TEXT NOT NULL,       -- Elevation profile array for chart scrub sync
  source TEXT NOT NULL DEFAULT 'strava_oauth',-- 'strava_oauth' or 'gpx_upload'
  strava_activity_id TEXT UNIQUE,             -- Strava activity ID (nullable)
  gpx_r2_url TEXT,                            -- Cloudflare R2 URL for uploaded .gpx file
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (adoption_ref_id) REFERENCES adoptions(adopter_id) ON DELETE CASCADE
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX idx_adoptions_email ON adoptions(email);
CREATE INDEX idx_adoptions_route ON adoptions(route_slug);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_run_logs_adoption_ref ON run_logs(adoption_ref_id);
CREATE INDEX idx_run_logs_route ON run_logs(route_slug);
```
