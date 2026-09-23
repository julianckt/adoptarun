import { describe, it, expect } from 'vitest';
import { buildAdoptionConfirmationEmail } from '@/email/adoption-confirmation';
import type { AdoptionEmailContext } from '@/email/adoption-confirmation';

const context: AdoptionEmailContext = {
  adopterId: '1104-JC',
  companionName: 'Lucky',
  routeName: 'Dragon’s Back Pangolin',
  charityName: 'SPCA Hong Kong',
  targetDate: '2026-09-27',
  targetTime: null,
  targetHkd: 500,
  confirmationUrl: 'https://adoptarun.org/signup/confirmed/1104-JC',
};

describe('Adoption confirmation email', () => {
  it('carries the Adopter ID in both the HTML and plain-text parts', () => {
    const email = buildAdoptionConfirmationEmail(context, null);

    expect(email.html).toContain('1104-JC');
    expect(email.text).toContain('1104-JC');
  });

  it('links to the confirmation page in both parts', () => {
    const email = buildAdoptionConfirmationEmail(context, null);

    expect(email.html).toContain('href="https://adoptarun.org/signup/confirmed/1104-JC"');
    expect(email.text).toContain('https://adoptarun.org/signup/confirmed/1104-JC');
  });

  it('renders the adoption details a Runner needs to act on', () => {
    const email = buildAdoptionConfirmationEmail(context, null);

    expect(email.text).toContain('Lucky');
    expect(email.text).toContain('Dragon’s Back Pangolin');
    expect(email.text).toContain('SPCA Hong Kong');
    expect(email.text).toContain('Sunday, 27 September 2026');
    expect(email.text).toContain('HK$500');
  });

  it('gives a Group Run its meetup time — the detail that gets a Runner there', () => {
    const email = buildAdoptionConfirmationEmail({ ...context, targetTime: '07:30' }, null);

    expect(email.text).toContain('07:30');
    expect(email.html).toContain('07:30');
  });

  it('shows no time for a solo adoption, which has none', () => {
    const email = buildAdoptionConfirmationEmail(context, null);

    expect(email.text).not.toContain('meetup');
  });

  it('omits the fundraising goal when no target was set', () => {
    const email = buildAdoptionConfirmationEmail({ ...context, targetHkd: null }, null);

    expect(email.text).not.toContain('fundraising goal');
    expect(email.html).not.toContain('fundraising goal');
  });

  it('carries no personal details — this email is the only copy of the ID, not a profile', () => {
    const email = buildAdoptionConfirmationEmail(context, null);

    expect(email.html).not.toContain('@');
    expect(email.text).not.toMatch(/\S+@\S+\.\S+/);
  });

  describe('Sanity copy slots', () => {
    const published = {
      _id: 'emailCopy',
      _type: 'emailCopy' as const,
      subject: 'you have adopted a run',
      preheader: 'here is your id',
      greeting: 'hello there',
      intro: 'welcome aboard',
      adopterIdLabel: 'your id',
      adopterIdNote: 'hold on to it',
      ctaIntro: 'see it here',
      ctaLabel: 'open my adoption',
      closing: 'see you out there',
      signoff: 'team aar',
      footerNote: 'sent because you adopted a run',
    };

    it('uses published wording in place of the defaults', () => {
      const email = buildAdoptionConfirmationEmail(context, published);

      expect(email.subject).toBe('you have adopted a run');
      expect(email.html).toContain('open my adoption');
      expect(email.text).toContain('see you out there');
      expect(email.text).not.toContain('the adopt a run team');
    });

    it('falls back to a default when a published field is blank', () => {
      const email = buildAdoptionConfirmationEmail(context, { ...published, signoff: '   ' });

      expect(email.text).toContain('the adopt a run team');
    });

    it('still produces a complete email when no copy has been published', () => {
      const email = buildAdoptionConfirmationEmail(context, null);

      expect(email.subject).toBe('your adoption is confirmed — welcome to the movement');
      expect(email.html).toContain('view my adoption');
    });
  });

  it('escapes Runner-supplied values so a companion name cannot inject markup', () => {
    const email = buildAdoptionConfirmationEmail(
      { ...context, companionName: '<img src=x onerror="alert(1)">' },
      null
    );

    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;img src=x');
  });
});
