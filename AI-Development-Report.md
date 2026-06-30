
# AI Development Report

This document outlines the AI tooling, models, and agentic processes utilized during the development of the AI Email Generator technical test task.

## 🌐 Live Demo
**[ai-email-generator-zeta.vercel.app](https://ai-email-generator-zeta.vercel.app)**

## 🛠️ Tools Used
- **AI Pair-Programmer**: Antigravity (powered by Claude Sonnet) — used as the primary agentic coding assistant throughout the entire project. Handled boilerplate scaffolding, architectural refactors, security audits, test generation, and debugging in an interactive pair-programming workflow.
- **AI Chat**: Google Gemini (for quick one-off lookups on Firebase Admin SDK edge cases and Next.js App Router patterns)
- **Version Control**: Git + GitHub with GitHub Actions for CI/CD automation

## 🤖 Models Applied
- **Claude Sonnet** (via Antigravity) — primary development agent for code generation, refactoring, and architecture decisions
- **Gemini 2.5 Flash** — the production AI model powering email generation inside the application itself

## 🔄 Development Process
1. **Foundation & Auth**: We began by establishing the Next.js App Router structure and implementing Firebase Auth. The Edge middleware protects routes based on client-side cookies, while the Server Actions independently verify JWTs via the Firebase Admin SDK — a dual-layer protection approach.
2. **AI Integration**: We integrated the `@google/generative-ai` SDK, configuring the Gemini 2.5 Flash model to return structured JSON. The service layer sanitizes raw Gemini output (stripping markdown code blocks) before calling `JSON.parse()` to prevent silent runtime failures.
3. **Refactoring & Architecture**: To fulfill strict technical requirements, we refactored the direct API calls into an **AI Factory Pattern**. This allowed us to dynamically swap between `GeminiService` and a `MockService` that perfectly simulated network delays and response shapes, drastically improving local testing reliability and preserving free-tier quotas.
4. **Security Hardening**: We performed a 360-degree security audit, introducing strict Zod validation on Server Actions to prevent prompt injection and data bloat via manipulated hidden fields. Every Server Action cryptographically verifies the Firebase `idToken` before executing any business logic — never trusting client-provided UIDs.
5. **UI Unification**: We unified the design system into a premium Indigo/Glassmorphism theme, ensuring all landing, auth, pricing, and dashboard pages were cohesive, modern, and fully responsive across Desktop, Tablet, and Mobile.
6. **Testing & QA Automation**: We implemented a `Vitest` suite to validate the Factory pattern logic and rate-limit error handling, and a raw Node stress-test script (`tsx`) to calibrate Gemini API rate limits manually across all five email tones.
7. **CI/CD & Deployment**: We configured GitHub Actions to automatically run lint, tests, and a production build on every push to `main`, with automatic deployment to Vercel.

## 💬 Key Prompts Used (15)
Here are the most impactful prompts provided to the AI agent during development:

1. *"Act as a Next.js Architect. Scaffold a Firebase Auth integration using Server Actions where the client passes an idToken to be verified by firebase-admin. Never trust client-provided UIDs."*
2. *"Refactor our direct Gemini AI logic to use the Factory/Strategy pattern so we can dynamically swap between a MockService and GeminiService based on an AI_PROVIDER environment variable."*
3. *"Write a strict Zod schema for our Email Generation request. The subject field must have a .refine() rule that rejects 20+ consecutive characters without spaces — to prevent prompt injection via keyboard mashing."*
4. *"Create a Vitest suite that mocks the @google/generative-ai SDK and verifies: (a) GeminiService correctly catches 429 Too Many Requests errors and returns a user-friendly message, and (b) the Factory returns MockService when AI_PROVIDER=mock."*
5. *"Act as an Expert UI/UX Designer. Unify the design system of the application to use a soft Indigo/Blue SaaS aesthetic with glassmorphism cards. Remove gimmicky bounce animations and implement sophisticated hover states with shadow transitions."*
6. *"Update our Next.js middleware to check for a firebase-token cookie and redirect unauthenticated users trying to access /dashboard or /history to /login, and authenticated users trying to access /login or /sign-up to /dashboard."*
7. *"Write a Firestore Data Converter for our EmailDocument type that safely handles missing timestamp fields by falling back to new Date() — to avoid crashes when reading legacy documents."*
8. *"Create a raw Node.js stress-test script using tsx that sequentially calls our email generation endpoint across all 5 tones and 3 lengths, logging the response time and whether the output was valid JSON — to calibrate Google's free-tier rate limits."*
9. *"Perform a ruthless 360-degree security audit on this codebase. Look specifically for: (1) IDOR vulnerabilities in Firestore writes, (2) unvalidated Server Action payloads, (3) any env vars accidentally prefixed with NEXT_PUBLIC_ that should be secret."*
10. *"Create a modern SaaS Pricing page using shadcn/ui Card components. Include a Free tier (2 emails/day) and a Pro tier ($9/month, unlimited) with a highlighted 'Most Popular' badge. The Upgrade button should exist but not need Stripe integration yet."*
11. *"Implement a Firestore Repository pattern. All database reads and writes must go through an email-repository.ts file using a typed FirestoreDataConverter. Server Actions must call repository methods, never adminDb directly."*
12. *"Build a History page that fetches the user's last 20 generated emails from Firestore, ordered by creation date descending. Each card should show subject, tone, length, date, and have a copy-to-clipboard button."*
13. *"The Gemini model sometimes returns JSON wrapped in markdown code blocks like \`\`\`json ... \`\`\`. Write a regex sanitizer function that strips these blocks before JSON.parse() is called — and add a unit test for it."*
14. *"Write a GitHub Actions CI workflow that: (1) runs on push to main and on PRs, (2) installs dependencies with npm ci, (3) runs ESLint, (4) runs the Vitest suite, (5) runs npm run build with AI_PROVIDER=mock and placeholder Firebase env vars so the build passes without real credentials."*
15. *"Generate a comprehensive README.md that covers: local npm setup, Docker Compose setup, all required environment variables with descriptions, the Serverless-first architectural decision rationale, and how to run the Vitest test suite."*

## 🚀 Future Improvements (With More Time)
- **Stripe Integration**: Connect the Pricing "Upgrade" button to a real Stripe Checkout session via webhooks to handle real subscriptions and enforce per-user usage limits from Firestore.
- **Custom System Tones**: Allow Pro users to define their own custom system prompts (e.g., "Write like Steve Jobs" or "Use Gen-Z slang") instead of the predefined 5 tones, stored per-user in Firestore.
- **Redis Rate Limiting**: Implement Upstash Redis to strictly rate-limit AI generation calls per user on the backend (e.g., 2/day on Free tier) to prevent abuse before hitting Google's rate limits.
- **Email Export**: Add a "Send via Email" feature using Resend or Nodemailer so users can dispatch generated emails directly from the dashboard without copy-pasting.
- **Streaming Responses**: Replace the current blocking `generateContent()` call with Gemini's streaming API (`generateContentStream()`) to show the email being typed out in real time, dramatically improving perceived performance.
