import type { EmailRequest } from '@/types';
import type { IEmailGeneratorService } from './types';

export class MockService implements IEmailGeneratorService {
  async generateEmail(params: EmailRequest): Promise<{ subject: string; body: string }> {
    console.info('[MockService] Simulating AI generation for:', params.purpose);

    // Simulate network latency (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isShort = params.length === 'short';
    const recipient = params.recipientName || params.recipientRole || 'Valued Client';

    // Hardcode a beautiful response based on the parameters
    return {
      subject: `Mock: ${params.purpose.substring(0, 30)}...`,
      body: `Dear ${recipient},

This is a simulated response from the Mock AI Service, ensuring the application remains robust during testing and review without expending API quotas.

${isShort ? '' : `You requested a "${params.tone}" tone. The Mock Service has bypassed the network request and instantly provided this placeholder text to validate UI rendering, form state, and error handling.\n\n`}Best regards,
${params.senderName}`,
    };
  }
}
