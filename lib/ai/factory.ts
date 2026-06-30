import type { IEmailGeneratorService } from './types';
import { MockService } from './mock-service';
import { GeminiService } from './gemini-service';

let instance: IEmailGeneratorService | undefined;

export function getAIService(): IEmailGeneratorService {
  if (instance) return instance;

  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === 'gemini') {
    console.info('[AIFactory] Initializing real Gemini AI Service');
    instance = new GeminiService();
  } else {
    console.info('[AIFactory] Initializing Mock AI Service (Fallback)');
    instance = new MockService();
  }

  return instance;
}
