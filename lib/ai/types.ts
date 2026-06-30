import type { EmailRequest } from '@/types';

export interface IEmailGeneratorService {
  /**
   * Generates a professional email subject and body based on the provided request.
   */
  generateEmail(params: EmailRequest): Promise<{ subject: string; body: string }>;
}
