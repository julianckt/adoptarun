import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { D1Database, D1PreparedStatement, D1Response, D1Result } from '@cloudflare/workers-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createMockD1(): D1Database {
  const sqlite = new DatabaseSync(':memory:');
  // Enable foreign keys
  sqlite.exec('PRAGMA foreign_keys = ON;');

  function createStatement(query: string, params: unknown[] = []): D1PreparedStatement {
    return {
      bind(...values: unknown[]) {
        return createStatement(query, values);
      },
      async first<T = unknown>(col?: string): Promise<T | null> {
        const stmt = sqlite.prepare(query);
        const row = stmt.get(...(params as any[])) as Record<string, any> | undefined;
        if (!row) return null;
        if (col) return (row[col] ?? null) as T;
        return row as T;
      },
      async all<T = unknown>(): Promise<D1Result<T>> {
        const stmt = sqlite.prepare(query);
        const rows = stmt.all(...(params as any[])) as T[];
        return {
          results: rows,
          success: true,
          meta: {} as any,
        };
      },
      async run(): Promise<D1Response> {
        const stmt = sqlite.prepare(query);
        const info = stmt.run(...(params as any[]));
        return {
          success: true,
          meta: {
            changes: info.changes,
            last_row_id: Number(info.lastInsertRowid),
            duration: 0,
            served_by: 'mock-d1',
          } as any,
        };
      },
      async raw<T = unknown[]>(): Promise<T[]> {
        const stmt = sqlite.prepare(query);
        return stmt.all(...(params as any[])) as any;
      },
    } as D1PreparedStatement;
  }

  return {
    prepare(query: string): D1PreparedStatement {
      return createStatement(query);
    },
    async exec(query: string) {
      sqlite.exec(query);
      return { count: 1, duration: 0 };
    },
    async batch(statements: D1PreparedStatement[]): Promise<D1Response[]> {
      sqlite.exec('BEGIN TRANSACTION;');
      try {
        const results: D1Response[] = [];
        for (const s of statements) {
          results.push(await s.run());
        }
        sqlite.exec('COMMIT;');
        return results;
      } catch (err) {
        sqlite.exec('ROLLBACK;');
        throw err;
      }
    },
    async dump(): Promise<ArrayBuffer> {
      throw new Error('dump() not implemented in mock');
    },
  } as unknown as D1Database;
}

/**
 * Creates a fresh mock D1 database with 0001_initial.sql migration applied.
 */
export async function createTestDb(): Promise<D1Database> {
  const db = createMockD1();
  const migrationPath = path.resolve(__dirname, '../../migrations/0001_initial.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  await db.exec(migrationSql);
  return db;
}
