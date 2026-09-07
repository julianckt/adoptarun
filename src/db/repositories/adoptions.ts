import type { D1Database } from '@cloudflare/workers-types';
import type {
  AdoptionRecord,
  AdoptionStatus,
  CreateAdoptionInput,
  CreateWalkInInput,
} from '../types';
import { formatAdopterId } from '../adopter-id';
import { CountersRepository } from './counters';

export class AdoptionsRepository {
  /**
   * Creates a standard adoption commitment with an atomic sequence jump and formatted Adopter ID.
   */
  static async create(
    db: D1Database,
    input: CreateAdoptionInput
  ): Promise<AdoptionRecord> {
    const seqNum = await CountersRepository.nextSequence(db, input.customJump);
    const adopterId = formatAdopterId(
      seqNum,
      input.runnerFirstName,
      input.runnerLastName
    );

    const routeSlug = input.routeSlug || 'open-run';
    const commitmentDays = input.commitmentDays !== undefined ? input.commitmentDays : 5;
    const targetHkd = input.targetHkd !== undefined ? input.targetHkd : 500;
    const status: AdoptionStatus = 'committed';

    await db
      .prepare(
        `INSERT INTO adoptions (
          seq_num, adopter_id, runner_first_name, runner_last_name, email,
          route_slug, charity_slug, commitment_days, target_date, target_hkd,
          animal_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        seqNum,
        adopterId,
        input.runnerFirstName.trim(),
        input.runnerLastName.trim(),
        input.email.trim().toLowerCase(),
        routeSlug,
        input.charitySlug,
        commitmentDays,
        input.targetDate,
        targetHkd,
        input.animalName.trim(),
        status
      )
      .run();

    const created = await this.getById(db, adopterId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created adoption: ${adopterId}`);
    }
    return created;
  }

  /**
   * Creates an upfront walk-in adoption with zero commitment days and status 'walk_in'.
   */
  static async createWalkIn(
    db: D1Database,
    input: CreateWalkInInput
  ): Promise<AdoptionRecord> {
    const today = new Date().toISOString().slice(0, 10);
    const seqNum = await CountersRepository.nextSequence(db, input.customJump);
    const adopterId = formatAdopterId(
      seqNum,
      input.runnerFirstName,
      input.runnerLastName
    );

    await db
      .prepare(
        `INSERT INTO adoptions (
          seq_num, adopter_id, runner_first_name, runner_last_name, email,
          route_slug, charity_slug, commitment_days, target_date, target_hkd,
          animal_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        seqNum,
        adopterId,
        input.runnerFirstName.trim(),
        input.runnerLastName.trim(),
        input.email.trim().toLowerCase(),
        'open-run',
        input.charitySlug,
        0,
        today,
        null,
        input.animalName.trim(),
        'walk_in'
      )
      .run();

    const created = await this.getById(db, adopterId);
    if (!created) {
      throw new Error(`Failed to retrieve walk-in adoption: ${adopterId}`);
    }
    return created;
  }

  /**
   * Fetches an adoption by Adopter ID (case-insensitive).
   */
  static async getById(
    db: D1Database,
    adopterId: string
  ): Promise<AdoptionRecord | null> {
    return await db
      .prepare('SELECT * FROM adoptions WHERE UPPER(adopter_id) = UPPER(?)')
      .bind(adopterId.trim())
      .first<AdoptionRecord>();
  }

  /**
   * Finds all adoptions associated with an email address.
   */
  static async findByEmail(
    db: D1Database,
    email: string
  ): Promise<AdoptionRecord[]> {
    const res = await db
      .prepare(
        'SELECT * FROM adoptions WHERE LOWER(email) = LOWER(?) ORDER BY created_at DESC'
      )
      .bind(email.trim())
      .all<AdoptionRecord>();
    return res.results || [];
  }

  /**
   * Finds adoptions by route slug.
   */
  static async findByRoute(
    db: D1Database,
    routeSlug: string
  ): Promise<AdoptionRecord[]> {
    const res = await db
      .prepare(
        'SELECT * FROM adoptions WHERE route_slug = ? ORDER BY created_at DESC'
      )
      .bind(routeSlug)
      .all<AdoptionRecord>();
    return res.results || [];
  }

  /**
   * Updates adoption status ('committed' | 'completed' | 'walk_in').
   */
  static async updateStatus(
    db: D1Database,
    adopterId: string,
    status: AdoptionStatus
  ): Promise<void> {
    await db
      .prepare(
        'UPDATE adoptions SET status = ?, updated_at = datetime(\'now\') WHERE UPPER(adopter_id) = UPPER(?)'
      )
      .bind(status, adopterId.trim())
      .run();
  }

  /**
   * Marks confirmation email as sent with ISO timestamp.
   */
  static async markEmailSent(
    db: D1Database,
    adopterId: string,
    timestamp = new Date().toISOString()
  ): Promise<void> {
    await db
      .prepare(
        'UPDATE adoptions SET confirmation_email_sent_at = ?, updated_at = datetime(\'now\') WHERE UPPER(adopter_id) = UPPER(?)'
      )
      .bind(timestamp, adopterId.trim())
      .run();
  }
}
