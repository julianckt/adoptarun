import { describe, it, expect, beforeEach } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createTestDb } from '../helpers/mock-d1';

describe('D1 SQLite Database Migrations (0001_initial.sql)', () => {
  let db: D1Database;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('initializes counters table with seed 1200', async () => {
    const row = await db
      .prepare('SELECT * FROM counters WHERE id = ?')
      .bind('adopter_seq')
      .first<{ id: string; current_val: number }>();

    expect(row).not.toBeNull();
    expect(row?.id).toBe('adopter_seq');
    expect(row?.current_val).toBe(1200);
  });

  it('creates adoptions table with correct schema and defaults', async () => {
    await db
      .prepare(
        `INSERT INTO adoptions (
          seq_num, adopter_id, runner_first_name, runner_last_name, email,
          charity_slug, animal_name, target_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(1200, '1200-JC', 'Julian', 'Chung', 'julian@example.com', 'spca', 'Lucky', '2026-09-15')
      .run();

    const row = await db
      .prepare('SELECT * FROM adoptions WHERE adopter_id = ?')
      .bind('1200-JC')
      .first<any>();

    expect(row.route_slug).toBe('open-run');
    expect(row.commitment_days).toBe(5);
    expect(row.target_hkd).toBe(500);
    expect(row.status).toBe('committed');
    expect(row.confirmation_email_sent_at).toBeNull();
    expect(row.created_at).toBeDefined();
  });

  it('creates run_logs table with foreign key cascade to adoptions', async () => {
    // Insert parent adoption
    await db
      .prepare(
        `INSERT INTO adoptions (
          seq_num, adopter_id, runner_first_name, runner_last_name, email,
          charity_slug, animal_name, target_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(1200, '1200-JC', 'Julian', 'Chung', 'julian@example.com', 'spca', 'Lucky', '2026-09-15')
      .run();

    // Insert run log
    await db
      .prepare(
        `INSERT INTO run_logs (
          run_id, adoption_ref_id, runner_name, distance_km, moving_time_seconds,
          elevation_gain_m, avg_pace_min_per_km, polyline_json, elevation_profile_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        '1200-JC',
        '1200-JC',
        'Julian Chung',
        5.2,
        1800,
        120,
        5.76,
        '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
        '[]'
      )
      .run();

    const log = await db
      .prepare('SELECT * FROM run_logs WHERE run_id = ?')
      .bind('1200-JC')
      .first<any>();

    expect(log).not.toBeNull();
    expect(log.source).toBe('strava_oauth');
    expect(log.distance_km).toBe(5.2);

    // Delete parent adoption -> cascades to run log
    await db.prepare('DELETE FROM adoptions WHERE adopter_id = ?').bind('1200-JC').run();
    const deletedLog = await db.prepare('SELECT * FROM run_logs WHERE run_id = ?').bind('1200-JC').first();
    expect(deletedLog).toBeNull();
  });

  it('creates all required performance indexes', async () => {
    const indexes = await db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
      .all<{ name: string }>();

    const names = (indexes.results || []).map((i) => i.name);
    expect(names).toContain('idx_adoptions_email');
    expect(names).toContain('idx_adoptions_route');
    expect(names).toContain('idx_adoptions_status');
    expect(names).toContain('idx_run_logs_adoption_ref');
    expect(names).toContain('idx_run_logs_route');
  });
});
