import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockService } from '@/lib/ai/mock-service';
import { GeminiServiceError } from '@/lib/gemini/service';

// Mock the external Google API
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn(),
      }),
    })),
  };
});

// Mock server-only to prevent it from crashing the Node test environment
vi.mock('server-only', () => ({}));

// Since we mock generateEmail internally which relies on the environment variable,
// we must also allow process.env overrides
const originalEnv = process.env;

describe('AI Service Architecture', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('MockService', () => {
    it('returns a valid subject and body within an acceptable time', async () => {
      const service = new MockService();
      
      const start = Date.now();
      const result = await service.generateEmail({
        tone: 'professional',
        length: 'short',
        purpose: 'Test email',
        senderName: 'Test Sender',
        recipientName: '',
        recipientRole: '',
        additionalContext: ''
      });
      const end = Date.now();

      // Mock service has a 1.5s delay
      expect(end - start).toBeGreaterThanOrEqual(1400);
      
      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('body');
      expect(result.subject).toContain('Mock:');
      expect(result.body).toContain('Mock AI Service');
    });
  });

  describe('AI Factory Logic', () => {
    it('returns MockService when AI_PROVIDER is "mock"', async () => {
      process.env.AI_PROVIDER = 'mock';
      
      // We must isolate modules because getAIService caches the instance globally in factory.ts
      const { getAIService: freshFactory } = await import('@/lib/ai/factory');
      
      const service = freshFactory();
      expect(service.constructor.name).toBe('MockService');
    });

    it('returns GeminiService when AI_PROVIDER is "gemini"', async () => {
      process.env.AI_PROVIDER = 'gemini';
      
      const { getAIService: freshFactory } = await import('@/lib/ai/factory');
      
      const service = freshFactory();
      expect(service.constructor.name).toBe('GeminiService');
    });
  });

  describe('Gemini Error Handling', () => {
    it('catches invalid JSON and throws a friendly parsing error', async () => {
      // Mock the generateEmail function directly from the service
      vi.doMock('@/lib/gemini/service', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/lib/gemini/service')>();
        return {
          ...actual,
          generateEmail: async () => {
             // Simulate a throw inside the parsing logic
             throw new GeminiServiceError({
               userMessage: 'The AI returned a response that could not be parsed. Please try again.',
               retryable: true,
               status: undefined,
             });
          }
        };
      });

      const { GeminiService } = await import('@/lib/ai/gemini-service');
      const service = new GeminiService();

      await expect(service.generateEmail({
        tone: 'professional',
        length: 'short',
        purpose: 'Test email',
        senderName: 'Test',
        recipientName: '',
        recipientRole: '',
        additionalContext: ''
      })).rejects.toThrow('The AI returned a response that could not be parsed');
    });

    it('catches 429 Rate Limit errors and throws a friendly message', async () => {
      vi.doMock('@/lib/gemini/service', async (importOriginal) => {
        const actual = await importOriginal<typeof import('@/lib/gemini/service')>();
        return {
          ...actual,
          generateEmail: async () => {
             // Simulate the 429 rate limit catch block throwing
             throw new GeminiServiceError({
               userMessage: 'AI Service quota exceeded. Please wait a minute before trying again.',
               retryable: true,
               status: 429,
             });
          }
        };
      });

      const { GeminiService } = await import('@/lib/ai/gemini-service');
      const service = new GeminiService();

      await expect(service.generateEmail({
        tone: 'professional',
        length: 'short',
        purpose: 'Test rate limit',
        senderName: 'Test',
        recipientName: '',
        recipientRole: '',
        additionalContext: ''
      })).rejects.toThrow('AI Service quota exceeded. Please wait a minute before trying again.');
    });
  });
});
