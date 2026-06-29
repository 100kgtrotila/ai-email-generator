import { z } from 'zod';
import type { EmailTone } from '@/types';

const TONES: [EmailTone, ...EmailTone[]] = [
  'professional',
  'friendly',
  'formal',
  'casual',
  'persuasive',
];

export const emailRequestSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  recipientRole: z.string().min(1, 'Recipient role is required').max(100),
  senderName: z.string().min(1, 'Sender name is required').max(100),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(1000),
  tone: z.enum(TONES, {
    message: 'Invalid tone selected',
  }),
  additionalContext: z.string().max(2000).optional().default(''),
});

export const generatedEmailSchema = z.object({
  id: z.uuid('Invalid email ID'),
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Body is required').max(10000),
  request: emailRequestSchema,
  createdAt: z.coerce.date({ message: 'Invalid date' }),
});
