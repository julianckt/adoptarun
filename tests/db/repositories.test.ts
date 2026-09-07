import { describe, it, expect, beforeEach } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createTestDb } from '../helpers/mock-d1';
import { CountersRepository } from '@/db/repositories/counters';
import { AdoptionsRepository } from '@/db/repositories/adoptions';
import { RunLogsRepository } from '@/db/repositories/run-logs';

describe('Domain Repositories Integration', () => {
  let db: D1Database;

  beforeEach(async () => {
    db = await createTestDb();
  });

  describe('CountersRepository', () => {
    it('retrieves initial current value of 1200', async () => {
      const val = await CountersRepository.getCurrentValue(db);
      expect(val).toBe(1200);
    });

    it('atomically increments sequence by random or custom jump', async () => {
      const seq1 = await CountersRepository.nextSequence(db, 3);
      expect(seq1).toBe(1203);

      const seq2 = await CountersRepository.nextSequence(db, 2);
      expect(seq2).toBe(1205);

      const seq3 = await CountersRepository.nextSequence(db);
      expect(seq3).toBeGreaterThanOrEqual(1206);
      expect(seq3).toBeLessThanOrEqual(1209);
    });
  });

  describe('AdoptionsRepository', () => {
    it('creates standard adoption with atomic sequence and formatted Adopter ID', async () => {
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'julian@adoptarun.org',
        routeSlug: 'dragon-back',
        charitySlug: 'spca',
        commitmentDays: 7,
        targetDate: '2026-09-20',
        targetHkd: 800,
        animalName: 'Sparky',
        customJump: 4,
      });

      expect(adoption.seq_num).toBe(1204);
      expect(adoption.adopter_id).toBe('1204-JC');
      expect(adoption.status).toBe('committed');
      expect(adoption.animal_name).toBe('Sparky');
      expect(adoption.target_hkd).toBe(800);
    });

    it('creates walk-in adoption with zero commitment days and status walk_in', async () => {
      const walkIn = await AdoptionsRepository.createWalkIn(db, {
        runnerFirstName: 'Cheryl',
        runnerLastName: 'Ng',
        email: 'cheryl@adoptarun.org',
        charitySlug: 'spca',
        animalName: 'Buddy',
        customJump: 1,
      });

      expect(walkIn.seq_num).toBe(1201);
      expect(walkIn.adopter_id).toBe('1201-CN');
      expect(walkIn.status).toBe('walk_in');
      expect(walkIn.commitment_days).toBe(0);
      expect(walkIn.target_hkd).toBeNull();
      expect(walkIn.route_slug).toBe('open-run');
    });

    it('finds adoptions by email and route', async () => {
      await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'multi@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-20',
        animalName: 'Dog 1',
        customJump: 1,
      });

      await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'multi@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-25',
        animalName: 'Dog 2',
        customJump: 2,
      });

      const list = await AdoptionsRepository.findByEmail(db, 'multi@adoptarun.org');
      expect(list.length).toBe(2);
      expect(list[0].email).toBe('multi@adoptarun.org');
    });

    it('updates status and email sent timestamp', async () => {
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'update@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-20',
        animalName: 'Tester',
        customJump: 1,
      });

      await AdoptionsRepository.updateStatus(db, adoption.adopter_id, 'completed');
      const updated = await AdoptionsRepository.getById(db, adoption.adopter_id);
      expect(updated?.status).toBe('completed');

      const now = new Date().toISOString();
      await AdoptionsRepository.markEmailSent(db, adoption.adopter_id, now);
      const emailUpdated = await AdoptionsRepository.getById(db, adoption.adopter_id);
      expect(emailUpdated?.confirmation_email_sent_at).toBe(now);
    });
  });

  describe('RunLogsRepository', () => {
    it('creates first run log with base Adopter ID and automatically marks adoption completed', async () => {
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'runner@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-20',
        animalName: 'Runner',
        customJump: 1,
      });

      const log = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: 'Julian Chung',
        distanceKm: 8.5,
        movingTimeSeconds: 2700,
        elevationGainM: 180,
        avgPaceMinPerKm: 5.29,
        polylineJson: 'abc',
        elevationProfileJson: [{ distance_km: 0, elevation_m: 10, lat: 22.3, lng: 114.1 }],
      });

      expect(log.run_id).toBe('1201-JC');
      expect(log.adoption_ref_id).toBe('1201-JC');

      // Check adoption status updated
      const parent = await AdoptionsRepository.getById(db, adoption.adopter_id);
      expect(parent?.status).toBe('completed');
    });

    it('assigns auto-suffix -2 and -3 for subsequent runs under same Adopter ID', async () => {
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'multi-run@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-20',
        animalName: 'Champ',
        customJump: 1,
      });

      const log1 = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: 'Julian Chung',
        distanceKm: 5.0,
        movingTimeSeconds: 1500,
        elevationGainM: 50,
        avgPaceMinPerKm: 5.0,
        polylineJson: 'poly1',
        elevationProfileJson: '[]',
      });
      expect(log1.run_id).toBe('1201-JC');

      const log2 = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: 'Julian Chung',
        distanceKm: 6.0,
        movingTimeSeconds: 1800,
        elevationGainM: 60,
        avgPaceMinPerKm: 5.0,
        polylineJson: 'poly2',
        elevationProfileJson: '[]',
      });
      expect(log2.run_id).toBe('1201-JC-2');

      const log3 = await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: 'Julian Chung',
        distanceKm: 7.0,
        movingTimeSeconds: 2100,
        elevationGainM: 70,
        avgPaceMinPerKm: 5.0,
        polylineJson: 'poly3',
        elevationProfileJson: '[]',
      });
      expect(log3.run_id).toBe('1201-JC-3');

      const allLogs = await RunLogsRepository.findByAdopterId(db, adoption.adopter_id);
      expect(allLogs.length).toBe(3);
    });

    it('enforces uniqueness on strava_activity_id', async () => {
      const adoption = await AdoptionsRepository.create(db, {
        runnerFirstName: 'Julian',
        runnerLastName: 'Chung',
        email: 'strava@adoptarun.org',
        charitySlug: 'spca',
        targetDate: '2026-09-20',
        animalName: 'StravaCat',
        customJump: 1,
      });

      await RunLogsRepository.create(db, {
        adoptionRefId: adoption.adopter_id,
        runnerName: 'Julian Chung',
        distanceKm: 5.0,
        movingTimeSeconds: 1500,
        elevationGainM: 50,
        avgPaceMinPerKm: 5.0,
        polylineJson: 'poly1',
        elevationProfileJson: '[]',
        stravaActivityId: 'strava_12345',
      });

      // Inserting duplicate Strava activity should throw
      await expect(
        RunLogsRepository.create(db, {
          adoptionRefId: adoption.adopter_id,
          runnerName: 'Julian Chung',
          distanceKm: 5.0,
          movingTimeSeconds: 1500,
          elevationGainM: 50,
          avgPaceMinPerKm: 5.0,
          polylineJson: 'poly1',
          elevationProfileJson: '[]',
          stravaActivityId: 'strava_12345',
        })
      ).rejects.toThrow();
    });
  });
});
