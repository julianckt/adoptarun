import type { D1Database } from '@cloudflare/workers-types';
import type { CreateRunLogInput, RunLogRecord } from '../types';
import { resolveNextRunId } from '../adopter-id';
import { AdoptionsRepository } from './adoptions';

export class RunLogsRepository {
  /**
   * Resolves the next run ID for an Adopter ID (auto-suffixing 1200-JC, 1200-JC-2, etc.).
   */
  static async getNextRunId(
    db: D1Database,
    adopterId: string
  ): Promise<string> {
    const logs = await this.findByAdopterId(db, adopterId);
    const existingRunIds = logs.map((l) => l.run_id);
    return resolveNextRunId(adopterId, existingRunIds);
  }

  /**
   * Creates a verified run log entry, resolves the run ID if omitted, and marks the adoption completed.
   */
  static async create(
    db: D1Database,
    input: CreateRunLogInput
  ): Promise<RunLogRecord> {
    const runId = input.runId || (await this.getNextRunId(db, input.adoptionRefId));
    const polylineJson = input.polylineJson;
    const elevationProfileJson =
      typeof input.elevationProfileJson === 'string'
        ? input.elevationProfileJson
        : JSON.stringify(input.elevationProfileJson);

    await db
      .prepare(
        `INSERT INTO run_logs (
          run_id, adoption_ref_id, runner_name, route_slug, distance_km,
          moving_time_seconds, elevation_gain_m, avg_pace_min_per_km,
          fundraised_hkd, polyline_json, elevation_profile_json, source,
          strava_activity_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        runId,
        input.adoptionRefId.trim(),
        input.runnerName.trim(),
        input.routeSlug || 'open-run',
        input.distanceKm,
        input.movingTimeSeconds,
        input.elevationGainM,
        input.avgPaceMinPerKm,
        input.fundraisedHkd ?? null,
        polylineJson,
        elevationProfileJson,
        input.source || 'strava_oauth',
        input.stravaActivityId || null
      )
      .run();

    // Mark parent adoption as completed
    await AdoptionsRepository.updateStatus(db, input.adoptionRefId, 'completed');

    const created = await this.getById(db, runId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created run log: ${runId}`);
    }
    return created;
  }

  /**
   * Retrieves a run log by run ID (case-insensitive).
   */
  static async getById(
    db: D1Database,
    runId: string
  ): Promise<RunLogRecord | null> {
    return await db
      .prepare('SELECT * FROM run_logs WHERE UPPER(run_id) = UPPER(?)')
      .bind(runId.trim())
      .first<RunLogRecord>();
  }

  /**
   * Finds all run logs associated with a parent adoption.
   */
  static async findByAdopterId(
    db: D1Database,
    adopterId: string
  ): Promise<RunLogRecord[]> {
    const res = await db
      .prepare(
        'SELECT * FROM run_logs WHERE UPPER(adoption_ref_id) = UPPER(?) ORDER BY created_at ASC'
      )
      .bind(adopterId.trim())
      .all<RunLogRecord>();
    return res.results || [];
  }

  /**
   * Finds all run logs for a specific route.
   */
  static async findByRoute(
    db: D1Database,
    routeSlug: string
  ): Promise<RunLogRecord[]> {
    const res = await db
      .prepare(
        'SELECT * FROM run_logs WHERE route_slug = ? ORDER BY created_at DESC'
      )
      .bind(routeSlug)
      .all<RunLogRecord>();
    return res.results || [];
  }

  /**
   * Finds run log by Strava activity ID (for idempotency checks).
   */
  static async findByStravaActivityId(
    db: D1Database,
    activityId: string
  ): Promise<RunLogRecord | null> {
    return await db
      .prepare('SELECT * FROM run_logs WHERE strava_activity_id = ?')
      .bind(activityId)
      .first<RunLogRecord>();
  }
}
