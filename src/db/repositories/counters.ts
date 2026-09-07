import type { D1Database } from '@cloudflare/workers-types';
import { getRandomJump } from '../adopter-id';

export class CountersRepository {
  /**
   * Initializes sequence counter row at specified seed (default 1200).
   */
  static async initialize(
    db: D1Database,
    initialSeed = 1200,
    counterId = 'adopter_seq'
  ): Promise<void> {
    await db
      .prepare(
        'INSERT OR IGNORE INTO counters (id, current_val) VALUES (?, ?)'
      )
      .bind(counterId, initialSeed)
      .run();
  }

  /**
   * Fetches the current value of the counter without mutating.
   */
  static async getCurrentValue(
    db: D1Database,
    counterId = 'adopter_seq'
  ): Promise<number> {
    const row = await db
      .prepare('SELECT current_val FROM counters WHERE id = ?')
      .bind(counterId)
      .first<{ current_val: number }>();
    if (!row) {
      await this.initialize(db, 1200, counterId);
      return 1200;
    }
    return row.current_val;
  }

  /**
   * Atomically mutates and increments the counter sequence by jump (+1 to +4).
   * Uses SQLite `UPDATE ... RETURNING current_val` for atomic execution.
   */
  static async nextSequence(
    db: D1Database,
    jump?: number,
    counterId = 'adopter_seq'
  ): Promise<number> {
    const delta = jump !== undefined ? jump : getRandomJump();

    // Upsert or increment atomically
    const updated = await db
      .prepare(
        'UPDATE counters SET current_val = current_val + ? WHERE id = ? RETURNING current_val'
      )
      .bind(delta, counterId)
      .first<{ current_val: number }>();

    if (updated && typeof updated.current_val === 'number') {
      return updated.current_val;
    }

    // Row did not exist: initialize and increment
    await this.initialize(db, 1200, counterId);
    const retry = await db
      .prepare(
        'UPDATE counters SET current_val = current_val + ? WHERE id = ? RETURNING current_val'
      )
      .bind(delta, counterId)
      .first<{ current_val: number }>();

    return retry?.current_val ?? 1200 + delta;
  }
}
