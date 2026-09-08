export const prerender = false;

import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { CountersRepository } from '@/db/repositories/counters';
import { AdoptionsRepository } from '@/db/repositories/adoptions';
import { RunLogsRepository } from '@/db/repositories/run-logs';
import { createTestDb } from '../../../tests/helpers/mock-d1';

// In-memory fallback instance for standard local 'npm run dev'
let devFallbackDb: D1Database | null = null;

async function getDb(locals: App.Locals): Promise<{ db: D1Database; source: string }> {
  if (locals.runtime?.env?.DB) {
    return { db: locals.runtime.env.DB, source: 'Cloudflare D1 Binding (Local/Remote)' };
  }
  if (!devFallbackDb) {
    devFallbackDb = await createTestDb();
  }
  return { db: devFallbackDb, source: 'In-Memory SQLite (Node 24 native node:sqlite)' };
}

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'demo';
    const { db, source } = await getDb(locals);

    if (action === 'demo') {
      // 1. Current Counter Value
      const initialVal = await CountersRepository.getCurrentValue(db);

      // 2. Create Adoption
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: url.searchParams.get('first') || 'Julian',
        runnerLastName: url.searchParams.get('last') || 'Chung',
        email: url.searchParams.get('email') || 'julian@example.com',
        charitySlug: 'spca',
        animalName: url.searchParams.get('animal') || 'Sparky',
        targetDate: '2026-09-30',
        routeSlug: 'dragon-back',
        commitmentDays: 5,
        targetHkd: 500,
      });

      // 3. Log First Run (Base ID)
      const run1 = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: `${adoption.runner_first_name} ${adoption.runner_last_name}`,
        distanceKm: 5.2,
        movingTimeSeconds: 1620,
        elevationGainM: 95,
        avgPaceMinPerKm: 5.19,
        polylineJson: '[]',
        elevationProfileJson: '[]',
      });

      // 4. Log Second Run (Auto-suffix -2)
      const run2 = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: `${adoption.runner_first_name} ${adoption.runner_last_name}`,
        distanceKm: 8.0,
        movingTimeSeconds: 2450,
        elevationGainM: 140,
        avgPaceMinPerKm: 5.10,
        polylineJson: '[]',
        elevationProfileJson: '[]',
      });

      // 5. Check Parent Adoption Status
      const parentAdoption = await AdoptionsRepository.getById(db, adoption.adopter_id);
      const allRuns = await RunLogsRepository.findByAdopterId(db, adoption.adopter_id);
      const endVal = await CountersRepository.getCurrentValue(db);

      return new Response(
        JSON.stringify(
          {
            success: true,
            databaseSource: source,
            summary: {
              initialCounter: initialVal,
              newCounter: endVal,
              counterJump: endVal - initialVal,
              adopterId: adoption.adopter_id,
              parentStatus: parentAdoption?.status,
              createdRunIds: [run1.run_id, run2.run_id],
              totalRunsForAdopter: allRuns.length,
            },
            createdAdoption: parentAdoption,
            createdRuns: allRuns,
            instructions: {
              info: 'This is a temporary test endpoint. Refresh the page to execute another jump and run cycle.',
              customQueryExamples: [
                '/api/test-db?first=Cheryl&last=Ng&animal=Buddy',
                '/api/test-db?action=list',
              ],
            },
          },
          null,
          2
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'list') {
      const counterVal = await CountersRepository.getCurrentValue(db);
      return new Response(
        JSON.stringify(
          {
            success: true,
            databaseSource: source,
            currentCounter: counterVal,
          },
          null,
          2
        ),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify(
        {
          success: false,
          error: error.message || String(error),
          stack: error.stack,
        },
        null,
        2
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
