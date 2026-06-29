AGENTS.md - AI Email Generator
This file is the working guide for AI coding agents in this repository. Treat the repository itself as the source of truth. If this document and the code disagree, inspect the code and update this document as part of the change.
Project Snapshot
Project: ai-email-generator
Type: Next.js Fullstack Application
Language: React 19 + TypeScript 5
Framework: Next.js (App Router)
Package manager: npm
Deployment config: Vercel (recommended)
The app allows users to generate professional emails using Google Gemini AI, save them to their history, and manage their profile. It features Firebase Authentication and Firestore for data persistence.
Package Manager
npm is the required package manager for this project.
Use npm install to install dependencies.
Use npm run <script> for package scripts.
Use npm install <package> for runtime dependencies.
Use npx <tool> for executing binaries (e.g., shadcn-ui).
Commands defined in package.json:
npm run dev: start the Next.js dev server (Turbopack enabled).
npm run build: build for production.
npm run start: run the production build.
npm run lint: run ESLint.
Runtime Configuration
The application relies heavily on environment variables for external services. These are stored in .env.local (ignored by Git).
Firebase Client (Public): Must be prefixed with NEXT_PUBLIC_.
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
Firebase Admin & Gemini (Secret/Server-Only): Must NEVER be prefixed with NEXT_PUBLIC_.
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY (Must be wrapped in double quotes to preserve \n).
GEMINI_API_KEY
Current Stack
Framework: Next.js (App Router)
UI/Styling: Tailwind CSS v4, shadcn/ui, Lucide React
Auth: Firebase Auth (Client-side sign-in, Server-side token verification)
Database: Firebase Admin SDK (Firestore)
AI: @google/generative-ai (Gemini 2.5 Flash)
Repository Layout
The project enforces a modular, serverless-first architecture.
src/ (or root)
  app/                  # Next.js App Router (Pages, Layouts, UI views)
    (auth)/             # Group for /login, /sign-up
    (dashboard)/        # Group for protected routes (/dashboard, /history, /profile)
  actions/              # Next.js Server Actions (Backend Controllers)
  components/           # Reusable UI primitives and providers
    ui/                 # shadcn/ui components
    shared/             # Custom shared components (e.g., LoadingSpinner)
    providers/          # React Context providers (AuthProvider)
  lib/                  # Business logic and external service integrations
    firebase/           # Firebase Client & Admin initialization, Firestore Repositories
    gemini/             # Gemini API service, Prompts, Error handling
  types/                # Shared TypeScript interfaces (Domain models)
Existing Patterns & Architectural Constraints
1. Server Actions (actions/)
Role: Act as the entry point for frontend mutations and data fetching.
Security: Every protected action MUST accept an idToken: string as its first argument and verify it using adminAuth.verifyIdToken(idToken). Never trust client-provided UIDs.
Return Type: Actions NEVER throw errors to the client. They must catch errors and return a strictly typed ActionResult<T> union: { success: true, data: T } | { success: false, error: string }.
2. Firebase & Firestore (lib/firebase/)
Admin Singleton: admin.ts must use a singleton pattern if (!getApps().length) to prevent hot-reload crashes in Next.js development.
Private Key Parsing: The cert() configuration must dynamically strip quotes and replace escaped \\n with actual \n to handle .env.local idiosyncrasies safely.
Repository Pattern: Firestore interactions must live in *-repository.ts files (e.g., email-repository.ts). Server actions call repository methods, not adminDb directly.
Data Converters: Every Firestore collection MUST use a FirestoreDataConverter to ensure type safety when moving between Domain Types (e.g., EmailDocument) and raw Firestore data.
3. Gemini AI Integration (lib/gemini/)
Lazy Initialization: GoogleGenerativeAI must be initialized on the first function call, not at module scope, to ensure immediate crash-on-missing-env-var during runtime.
Prompt Isolation: Prompts must be built using pure functions in prompts.ts to keep the service logic clean.
Output Sanitization: The Gemini model (gemini-2.5-flash) often wraps JSON in markdown blocks (json ... ). The service.ts parser MUST sanitize the raw text (using regex to strip markdown) before calling JSON.parse().
Error Masking: Raw SDK errors must be caught and mapped to safe, user-friendly messages via classifyGeminiError() before returning to the Server Action.
4. Routing & Auth Flow
Public routes: /, /login, /sign-up.
Protected routes: /dashboard, /history, /profile.
Client Auth State: Handled by AuthProvider (onAuthStateChanged).
Route Guarding: Unauthenticated users trying to access protected routes are redirected to /login via useEffect in the layout, or via Next.js Middleware.
5. UI & Styling
Use shadcn/ui components for building interfaces.
Use lucide-react for icons.
Avoid inline styles. Use Tailwind utility classes. Merge conditional classes using the cn() utility (lib/utils.ts).
Ensure mobile-first responsiveness (use Tailwind prefixes sm:, md:, lg:).
Security Notes
Never expose FIREBASE_ADMIN_* or GEMINI_API_KEY to the client (do not prefix with NEXT_PUBLIC_).
Server Actions must always independently verify user authorization via Firebase Admin before performing database writes or AI generation.
Do not log full JWT tokens, private keys, or generated PII in the console.
Future/Planned Standards
Zod Validation: All incoming data payloads to Server Actions should eventually be validated through strict zod schemas to guarantee runtime type safety before hitting the database or AI models.