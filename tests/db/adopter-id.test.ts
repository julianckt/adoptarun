import { describe, it, expect } from 'vitest';
import {
  extractInitials,
  formatAdopterId,
  isValidAdopterId,
  parseAdopterId,
  getRandomJump,
  resolveNextRunId,
} from '@/db/adopter-id';

describe('Adopter ID Generator Module', () => {
  describe('extractInitials', () => {
    it('extracts standard first and last name initials', () => {
      expect(extractInitials('Julian', 'Chung')).toBe('JC');
      expect(extractInitials('Cheryl', 'Ng')).toBe('CN');
      expect(extractInitials('Alan', 'Turing')).toBe('AT');
    });

    it('falls back to second letter of first name when last name is missing', () => {
      expect(extractInitials('Julian')).toBe('JU');
      expect(extractInitials('Julian', '')).toBe('JU');
      expect(extractInitials('Sam', '   ')).toBe('SA');
    });

    it('falls back to "A" when first name has only one letter and no last name', () => {
      expect(extractInitials('J')).toBe('JA');
      expect(extractInitials('X', '')).toBe('XA');
    });

    it('handles uppercase conversion and strips non-ASCII/whitespace', () => {
      expect(extractInitials('  julian  ', '  chung  ')).toBe('JC');
      expect(extractInitials('J123', 'C456')).toBe('JC');
    });
  });

  describe('formatAdopterId', () => {
    it('formats sequence numbers with 4-digit zero-padding', () => {
      expect(formatAdopterId(1, 'Julian', 'Chung')).toBe('0001-JC');
      expect(formatAdopterId(1200, 'Julian', 'Chung')).toBe('1200-JC');
      expect(formatAdopterId(1204, 'Cheryl', 'Ng')).toBe('1204-CN');
    });

    it('expands beyond 4 digits if sequence exceeds 9999', () => {
      expect(formatAdopterId(10025, 'Julian', 'Chung')).toBe('10025-JC');
    });
  });

  describe('isValidAdopterId & parseAdopterId', () => {
    it('validates canonical Adopter IDs', () => {
      expect(isValidAdopterId('1200-JC')).toBe(true);
      expect(isValidAdopterId('1204-CN')).toBe(true);
      expect(isValidAdopterId('10025-JC')).toBe(true);
      expect(isValidAdopterId('120-JC')).toBe(false); // only 3 digits
      expect(isValidAdopterId('1200-J')).toBe(false); // only 1 letter
      expect(isValidAdopterId('1200-12')).toBe(false); // numeric initials
      expect(isValidAdopterId('invalid')).toBe(false);
    });

    it('parses valid Adopter IDs into components', () => {
      expect(parseAdopterId('1204-JC')).toEqual({ seqNum: 1204, initials: 'JC' });
      expect(parseAdopterId('10001-AB')).toEqual({ seqNum: 10001, initials: 'AB' });
      expect(parseAdopterId('bad-id')).toBeNull();
    });
  });

  describe('getRandomJump', () => {
    it('returns integers strictly between 1 and 4', () => {
      for (let i = 0; i < 200; i++) {
        const jump = getRandomJump();
        expect(jump).toBeGreaterThanOrEqual(1);
        expect(jump).toBeLessThanOrEqual(4);
        expect(Number.isInteger(jump)).toBe(true);
      }
    });
  });

  describe('resolveNextRunId (Multi-Run Auto-Suffixing)', () => {
    it('returns base ID when no runs exist yet', () => {
      expect(resolveNextRunId('1200-JC', [])).toBe('1200-JC');
    });

    it('returns base ID when existing runs do not include this base ID', () => {
      expect(resolveNextRunId('1200-JC', ['1201-AB', '1202-CD'])).toBe('1200-JC');
    });

    it('assigns -2 suffix for second run when base ID exists', () => {
      expect(resolveNextRunId('1200-JC', ['1200-JC'])).toBe('1200-JC-2');
    });

    it('assigns sequential suffixes for third and subsequent runs', () => {
      expect(resolveNextRunId('1200-JC', ['1200-JC', '1200-JC-2'])).toBe('1200-JC-3');
      expect(resolveNextRunId('1200-JC', ['1200-JC', '1200-JC-2', '1200-JC-3'])).toBe('1200-JC-4');
    });

    it('handles non-consecutive suffixes by choosing highest + 1', () => {
      expect(resolveNextRunId('1200-JC', ['1200-JC', '1200-JC-2', '1200-JC-5'])).toBe('1200-JC-6');
    });

    it('isolates different base IDs from each other', () => {
      expect(resolveNextRunId('1200-JC', ['1201-JC', '1201-JC-2'])).toBe('1200-JC');
    });
  });
});
