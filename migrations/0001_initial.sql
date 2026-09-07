-- 1. COUNTERS TABLE (Atomic sequence generator for Adopter IDs)
CREATE TABLE IF NOT EXISTS counters (
  id TEXT PRIMARY KEY,
  current_val INTEGER NOT NULL DEFAULT 1200
);

-- Seed initial row at 1200
INSERT OR IGNORE INTO counters (id, current_val) VALUES ('adopter_seq', 1200);

-- 2. ADOPTIONS TABLE (Runner adoption portal commitments & upfront walk-ins)
CREATE TABLE IF NOT EXISTS adoptions (
  seq_num INTEGER NOT NULL,
  adopter_id TEXT PRIMARY KEY,
  runner_first_name TEXT NOT NULL,
  runner_last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  route_slug TEXT NOT NULL DEFAULT 'open-run',
  charity_slug TEXT NOT NULL,
  commitment_days INTEGER NOT NULL DEFAULT 5,
  target_date TEXT NOT NULL,
  target_hkd INTEGER DEFAULT 500,
  animal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'committed',
  confirmation_email_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. RUN_LOGS TABLE (Verified completed run telemetry for /log/:run_id)
CREATE TABLE IF NOT EXISTS run_logs (
  run_id TEXT PRIMARY KEY,
  adoption_ref_id TEXT NOT NULL,
  runner_name TEXT NOT NULL,
  route_slug TEXT NOT NULL DEFAULT 'open-run',
  distance_km REAL NOT NULL,
  moving_time_seconds INTEGER NOT NULL,
  elevation_gain_m INTEGER NOT NULL,
  avg_pace_min_per_km REAL NOT NULL,
  fundraised_hkd INTEGER,
  polyline_json TEXT NOT NULL,
  elevation_profile_json TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'strava_oauth',
  strava_activity_id TEXT UNIQUE,
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (adoption_ref_id) REFERENCES adoptions(adopter_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adoptions_email ON adoptions(email);
CREATE INDEX IF NOT EXISTS idx_adoptions_route ON adoptions(route_slug);
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON adoptions(status);
CREATE INDEX IF NOT EXISTS idx_run_logs_adoption_ref ON run_logs(adoption_ref_id);
CREATE INDEX IF NOT EXISTS idx_run_logs_route ON run_logs(route_slug);
