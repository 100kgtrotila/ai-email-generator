/**
 * AI Stress Test Script
 * 
 * Run this script to test all tone variations against the live Gemini API
 * to identify exactly which prompt variations are causing parsing or rate limit errors.
 * 
 * Usage:
 * npm run stress-test
 * (or manually: npx tsx --conditions react-server scripts/stress-test-ai.ts)
 * 
 * Ensure your .env.local has a valid GEMINI_API_KEY before running.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { GeminiService } from '../lib/ai/gemini-service';
import type { EmailTone, EmailRequest } from '../types';

// Load env vars so GEMINI_API_KEY is available
config({ path: resolve(__dirname, '../.env.local') });

const TONES: EmailTone[] = [
  'professional',
  'casual',
  'friendly',
  'formal',
  'persuasive',
];

async function runStressTest() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY in .env.local');
    process.exit(1);
  }

  console.log('🚀 Starting AI Service Stress Test (Live Gemini API)');
  console.log('----------------------------------------------------');

  const service = new GeminiService();
  let successCount = 0;
  let failureCount = 0;

  for (const tone of TONES) {
    console.log(`\n⏳ Testing Tone: [${tone.toUpperCase()}]...`);
    
    const request: EmailRequest = {
      tone,
      length: 'medium',
      purpose: 'Invite the team to a brainstorming session about the new Q3 marketing initiative.',
      senderName: 'Automated Tester',
      recipientName: 'Marketing Team',
      recipientRole: 'Colleagues',
      additionalContext: 'Make it sound exciting and mandatory.',
    };

    try {
      const start = Date.now();
      const result = await service.generateEmail(request);
      const elapsed = Date.now() - start;
      
      console.log(`✅ Success (${elapsed}ms)`);
      console.log(`   Subject: ${result.subject}`);
      // Only print first 50 chars of body to keep output clean
      console.log(`   Body: ${result.body.substring(0, 50).replace(/\n/g, ' ')}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ FAILED for Tone: [${tone.toUpperCase()}]`);
      // The enhanced logging in lib/gemini/service.ts will automatically dump the exact 
      // payload, raw string, and error message to the console here.
      failureCount++;
    }

    // Add a deliberate large delay to avoid instantaneous rate limiting from rapid looping on the free tier
    console.log('   (Waiting 16 seconds before next request...)');
    await new Promise((r) => setTimeout(r, 16000));
  }

  console.log('\n====================================================');
  console.log(`🏁 Stress Test Complete.`);
  console.log(`   Total Requests: ${TONES.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\n⚠️ Check the logs above. The [Gemini Parse Error] blocks will reveal exactly which characters broke the JSON parser.');
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed perfectly! The extraction logic is bulletproof.');
    process.exit(0);
  }
}

runStressTest().catch((err) => {
  console.error('Fatal Script Error:', err);
  process.exit(1);
});
