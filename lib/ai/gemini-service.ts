import type { EmailRequest } from '@/types';
import type { IEmailGeneratorService } from './types';
import { generateEmail } from '@/lib/gemini/service';

export class GeminiService implements IEmailGeneratorService {
  async generateEmail(params: EmailRequest): Promise<{ subject: string; body: string }> {
    // Delegates to the existing robust Gemini implementation
    // retaining the strict schema prompts and error catching.
    return generateEmail(params);
  }
}
