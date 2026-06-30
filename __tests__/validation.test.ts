import { describe, it, expect } from 'vitest';
import { emailGenerationSchema } from '@/lib/validations/email';

describe('Email Validation Schema', () => {
  it('passes with a perfectly formed request', () => {
    const validData = {
      subject: 'Quarterly financial report review',
      tone: 'professional',
      length: 'medium',
      context: 'Please review the attached Q3 financial report.',
    };

    const result = emailGenerationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('Negative Tests', () => {
    it('fails if the subject is too short', () => {
      const invalidData = {
        subject: 'Hi', // Less than 5 chars
        tone: 'casual',
        length: 'short',
        context: '',
      };

      const result = emailGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Subject must be at least 5 characters.');
      }
    });

    it('fails if the tone is outside allowed enum values', () => {
      const invalidData = {
        subject: 'Good subject length',
        tone: 'aggressive', // Not in TONES
        length: 'short',
        context: '',
      };

      const result = emailGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('fails if the length is outside allowed enum values', () => {
      const invalidData = {
        subject: 'Good subject length',
        tone: 'professional',
        length: 'extra-long', // Not in LENGTHS
        context: '',
      };

      const result = emailGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('fails if the context contains a keyboard smash', () => {
      const invalidData = {
        subject: 'Good subject length',
        tone: 'professional',
        length: 'medium',
        context: 'Here is the context: asdfghjklqwertyuiopzxcvbnm', // 26 chars > 20
      };

      const result = emailGenerationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.message.includes('gibberish'))).toBe(true);
      }
    });
  });
});
