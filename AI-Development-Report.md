# AI Development Report

This document outlines the AI tooling, models, and agentic processes utilized during the development of the AI Email Generator technical test task.

## 🛠️ Tools Used
- **IDE**: Cursor / Windsurf
- **Agentic Assistance**: Advanced conversational AI integrated as a pair-programmer to assist with boilerplate, structural refactors, testing, and debugging.

## 🤖 Models Applied
- Gemini 3.1 Pro, Claude Sonnet 4.6, ChatGPT 5.5

## 🔄 Development Process
1. **Foundation & Auth**: We began by establishing the Next.js App Router structure and implementing Firebase Auth. We ensured the Edge middleware protected routes based on client-side cookies, while the Server Actions independently verified JWTs via the Admin SDK.
2. **AI Integration**: We integrated the Gemini SDK, configuring it to return structured JSON.
3. **Refactoring & Architecture**: To fulfill strict technical requirements, we refactored the direct API calls into an **AI Factory Pattern**. This allowed us to dynamically swap between `GeminiService` and a `MockService` that perfectly simulated network delays and response shapes, drastically improving local testing reliability and preserving free-tier quotas.
4. **Security Hardening**: We performed a 360-degree security audit, introducing strict Zod validation on Server Actions to prevent prompt injection and data bloat via manipulated hidden fields.
5. **UI Unification**: We unified the fragmented design system into a premium Indigo/Glassmorphism theme, ensuring all landing, auth, pricing, and dashboard pages were cohesive, modern, and fully responsive.
6. **Testing & QA Automation**: We concluded by implementing a `Vitest` suite to validate the Factory logic, and a raw Node stress-test script (`tsx`) to calibrate API rate limits manually.

## 💬 Key Prompts Used
Here are realistic examples of the prompts provided to the AI agent during development to achieve our architectural goals:
1. *"Act as a Next.js Architect. Scaffold a Firebase Auth integration using Server Actions where the client passes an idToken to be verified by firebase-admin."*
2. *"Refactor our direct Gemini AI logic to use the Factory/Strategy pattern so we can dynamically swap between a MockService and GeminiService based on an environment variable."*
3. *"Write a strict Zod schema for our Email Generation request. Protect against keyboard mashing by adding a .refine() rule that checks for 20+ consecutive characters without spaces."*
4. *"Create a Vitest suite that mocks the @google/generative-ai SDK and verifies that our GeminiService correctly catches 429 Too Many Requests errors and returns a user-friendly message."*
5. *"Act as an Expert UI/UX Designer. Unify the design system of the application to use a soft Indigo/Blue SaaS aesthetic. Remove gimmicky bounce animations and implement sophisticated hover states."*
6. *"Update our Next.js middleware to check for a 'firebase-token' cookie and redirect unauthenticated users from /dashboard to /login."*
7. *"Create a manual Node script using tsx to stress-test the Gemini API locally across all tones to see exactly which payloads trigger parsing errors."*
8. *"Perform a ruthless 360-degree security audit on this codebase. Check for IDOR vulnerabilities and unvalidated Server Action payloads."*
9. *"Create a modern SaaS Pricing page using shadcn/ui components and our global Indigo theme. Include a Free tier and a Pro tier with an Upgrade button."*
10. *"Generate a comprehensive README.md including local setup, Docker compose instructions, and our Serverless-first architectural decisions."*

## 🚀 Future Improvements (With More Time)
- **Stripe Integration**: Connect the Pricing "Upgrade" button to a real Stripe Checkout session via webhooks to handle real subscriptions.
- **Custom System Tones**: Allow Pro users to define their own custom system prompts (e.g., "Write like Steve Jobs" or "Use Gen-Z slang") instead of the predefined 5 tones.
- **Redis Rate Limiting**: Implement Upstash Redis to strictly rate-limit API calls per user on the backend to prevent abuse prior to hitting Google's rate limits.
- **CI/CD Pipeline**: Integrate GitHub Actions to automatically run the Vitest suite, ESLint checks, and trigger Vercel deployments on push to the `main` branch.
