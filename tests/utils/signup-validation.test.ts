import { describe, it, expect } from 'vitest';
import {
  validateRunnerDetails,
  validateCompanionName,
  type RunnerDetails,
} from '../../src/utils/signup-validation';

const valid: RunnerDetails = {
  firstName: 'Peter',
  lastName: 'Chan',
  email: 'peter.chan@example.com',
};

describe('validateRunnerDetails', () => {
  it('accepts a complete set of ASCII details', () => {
    const result = validateRunnerDetails(valid);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('trims surrounding whitespace before judging a field', () => {
    const result = validateRunnerDetails({ ...valid, firstName: '  Peter  ' });

    expect(result.isValid).toBe(true);
  });

  describe('names', () => {
    it('names the problem when a first name is missing', () => {
      const result = validateRunnerDetails({ ...valid, firstName: '   ' });

      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe('Enter your first name.');
    });

    it('names the problem when a last name is missing', () => {
      const result = validateRunnerDetails({ ...valid, lastName: '' });

      expect(result.errors.lastName).toBe('Enter your last name.');
    });

    it('rejects digits, which cannot become an Adopter ID initial', () => {
      const result = validateRunnerDetails({ ...valid, firstName: 'J0hn' });

      expect(result.errors.firstName).toBe(
        'Use English letters only — your initials become part of your Adopter ID.'
      );
    });

    it('accepts the punctuation real names carry', () => {
      expect(validateRunnerDetails({ ...valid, lastName: "O'Brien" }).isValid).toBe(true);
      expect(validateRunnerDetails({ ...valid, lastName: 'Wong-Smith' }).isValid).toBe(true);
      expect(validateRunnerDetails({ ...valid, firstName: 'Mary Jane' }).isValid).toBe(true);
    });

    it('requires a letter first, since that letter becomes the initial', () => {
      const result = validateRunnerDetails({ ...valid, firstName: "'Ada" });

      expect(result.errors.firstName).toBe(
        'Use English letters only — your initials become part of your Adopter ID.'
      );
    });

    it('rejects characters outside ASCII and says what to do', () => {
      const result = validateRunnerDetails({ ...valid, firstName: '陳' });

      expect(result.errors.firstName).toBe(
        'Use English letters only — your initials become part of your Adopter ID.'
      );
    });
  });

  describe('email', () => {
    it('names the problem when the email is missing', () => {
      const result = validateRunnerDetails({ ...valid, email: '' });

      expect(result.errors.email).toBe('Enter your email so we can send your Adopter ID.');
    });

    it('rejects an address with no domain', () => {
      const result = validateRunnerDetails({ ...valid, email: 'peter.chan' });

      expect(result.errors.email).toBe('That email address looks incomplete.');
    });

    it('rejects an address with no user part', () => {
      const result = validateRunnerDetails({ ...valid, email: '@example.com' });

      expect(result.errors.email).toBe('That email address looks incomplete.');
    });

    it('rejects an address with a bare domain', () => {
      const result = validateRunnerDetails({ ...valid, email: 'peter@example' });

      expect(result.errors.email).toBe('That email address looks incomplete.');
    });

    it('rejects characters outside ASCII', () => {
      const result = validateRunnerDetails({ ...valid, email: 'pétér@example.com' });

      expect(result.errors.email).toBe('Use English letters only in your email address.');
    });

    it('accepts a plus-addressed inbox', () => {
      const result = validateRunnerDetails({ ...valid, email: 'peter+runs@example.co.uk' });

      expect(result.isValid).toBe(true);
    });
  });

  it('reports every failing field at once rather than one at a time', () => {
    const result = validateRunnerDetails({ firstName: '', lastName: '', email: '' });

    expect(Object.keys(result.errors).sort()).toEqual(['email', 'firstName', 'lastName']);
  });
});

describe('validateCompanionName', () => {
  it('accepts a name', () => {
    expect(validateCompanionName('Mochi')).toBeNull();
  });

  it('names the problem when the companion is unnamed', () => {
    expect(validateCompanionName('   ')).toBe('Name your companion to complete the adoption.');
  });
});
