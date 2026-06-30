import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmailAction } from '@/actions/email.actions';
import { adminAuth } from '@/lib/firebase/admin';

// Mock Firebase Admin Auth
vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(),
  },
}));

// Mock the AI Factory to avoid real API calls
vi.mock('@/lib/ai/factory', () => {
  return {
    getAIService: () => ({
      generateEmail: vi.fn().mockResolvedValue({
        subject: 'Mocked Subject',
        body: 'Mocked Body',
      }),
    }),
  };
});

// Mock Server-Only
vi.mock('server-only', () => ({}));

describe('Server Action Logic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('generateEmailAction', () => {
    it('returns success for a valid request and valid token', async () => {
      // Simulate successful token verification
      vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      } as any);

      const result = await generateEmailAction('valid-token', {
        senderName: 'Test Sender',
        recipientName: '',
        recipientRole: '',
        purpose: 'Valid purpose length',
        tone: 'professional',
        additionalContext: '',
        length: 'medium',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subject).toBe('Mocked Subject');
      }
    });

    it('returns failure if the ID token is invalid', async () => {
      // Simulate failed token verification
      vi.mocked(adminAuth.verifyIdToken).mockRejectedValue(new Error('Invalid token'));

      const result = await generateEmailAction('invalid-token', {
        senderName: 'Test Sender',
        recipientName: '',
        recipientRole: '',
        purpose: 'Valid purpose length',
        tone: 'professional',
        additionalContext: '',
        length: 'medium',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Unauthorized.');
      }
    });

    it('returns failure if input validation fails (e.g., purpose too short)', async () => {
      vi.mocked(adminAuth.verifyIdToken).mockResolvedValue({
        uid: 'test-user-id',
      } as any);

      const result = await generateEmailAction('valid-token', {
        senderName: 'Test Sender',
        recipientName: '',
        recipientRole: '',
        purpose: 'Hi', // Too short, minimum is 5 characters based on emailRequestSchema
        tone: 'professional',
        additionalContext: '',
        length: 'medium',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('purpose: Purpose must be at least 5 characters');
      }
    });
  });
});
